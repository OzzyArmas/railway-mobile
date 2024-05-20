import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TextInput, Button } from 'react-native';
import Modal from 'react-native-modal';
import CreateContainerButton from "../Containers/components/CreateContainerButton";
import ContainerDetailsSheet from '../Containers/components/ContainerDetailSheet';
import ContainerGrid from '../Containers/components/ContainerGrid';
import { useDeploymentsLazyQuery, useEnvironmentLazyQuery, useServiceDeleteMutation, useServiceLazyQuery } from '../generated/graphql';
import { MinServiceInfo } from '../common/types';
import DeleteButton from '../Containers/components/DeleteButton';
import InfoSquareButton from '../Containers/components/InfoSquareButton';
import { useDispatch, useSelector } from 'react-redux';
import { setEnv } from '../reducers/env-reducer';
import Alert from '../../assets/svg/alert-black.svg';
import { RootState } from '../store/store';


const POLL_ENVIRONMENT_INTERVAL = 2000;

const DestructiveChangesModal = ({ serviceId, isModalVisible, setIsModalVisible }) => {
  const [deleteService, {error, loading }] = useServiceDeleteMutation();
  const [deleted, setDeleted] = useState(false);
  const handleOnPressDelete = () => {
    console.log("deleting service:", serviceId)
    deleteService({variables: {id: serviceId}}).then((res) =>  {
      if (!res.errors) {
        setDeleted(true);
      }
    });
  };
  
  useEffect(() => {
    if (error) {
      console.log(error)
    }
  }, [error]);

  return (
    <View>
      <Modal 
        isVisible={isModalVisible} 
        hasBackdrop={true} 
        onBackButtonPress={() => setIsModalVisible(false)} 
        onBackdropPress={() => {
          setIsModalVisible(false)
          if (deleted) { 
            setDeleted(false);
          }
        }}>
        <View style={styles.destructiveModalContent}>
          <Alert height={50}/>
          <View style={styles.modalText}>
            <Text style={styles.title}> Applying Destructive Changes! </Text>
            <Text style={styles.subtitle}> Continue applying destructive changes? </Text>
          </View>
          <View style={styles.button}>
            {loading ? <ActivityIndicator/> : <DeleteButton onPress={handleOnPressDelete}/>}
            {error && <Text> An error occurred during service deletion! </Text>}
          </View>
          {deleted && <Text style={{marginTop: 20}}> Service Deleted! </Text>}
        </View>
      </Modal>
    </View>
  )
};

const EnvironmentModal = ({ isVisible, setIsVisible}) => {
  const [apiToken, setApiToken] = useState("");
  const [projectId, setProjectId] = useState("");
  const [envId, setEnvId] = useState("");

  const dispatch = useDispatch();
  const env = useSelector((state: RootState) => state.env.value);

  const handleFormSubmit = ()  => {
    dispatch(setEnv({envId: envId.trim(), projectId: projectId.trim(), auth: apiToken.trim()}));
  }
  return (
    <View>
      <Modal isVisible={isVisible} 
        hasBackdrop={true} 
        onBackButtonPress={() => setIsVisible(false)} 
        onBackdropPress={() => setIsVisible(false)}>
      <View style={styles.inputModalContent}>
        <Text style={styles.inputDescription}>Auth Token: </Text>
          <TextInput
            style={styles.input}
            value={apiToken}
            onChangeText={setApiToken}
            placeholder={"please insert your API token"}
            autoCapitalize='none'
            placeholderTextColor={"#b7b8b9"}
            secureTextEntry
          />
           <Text style={styles.inputDescription}>Project ID: </Text>
          <TextInput
            style={styles.input}
            value={projectId}
            onChangeText={setProjectId}
            placeholder={"please insert your project id"}
            autoCapitalize='none'
            placeholderTextColor={"#b7b8b9"}
            secureTextEntry={true}

          />
           <Text style={styles.inputDescription}>Environment ID: </Text>
          <TextInput
            style={styles.input}
            value={envId}
            onChangeText={setEnvId}
            placeholder={"please insert your environment id"}
            autoCapitalize='none'
            placeholderTextColor={"#b7b8b9"}
            secureTextEntry={true}
          />
          
          {
          env.authError && 
          <View style={styles.credentialsIssue}>
            <Text style={{color: "red", justifyContent: "center"}}> There was an issue with your credentials. </Text> 
            <Text style={{color: "red"}}> Please ensure they are correct. </Text>
          </View>
          }
      </View>
      <View style={styles.submitButton}>
        <Button color="#fafbfc" title="Submit" onPress={handleFormSubmit} />
      </View>
      </Modal>
    </View>
  )
}

const HomeScreen = ({ navigation }) => {
  const [services, setServices] = useState<MinServiceInfo[]>([]);
  const [isDestructiveModalVisible, setIsDestructiveModalVisible] = useState(false);
  const [isEnvironmentModalVisible, setIsEnvironmentModalVisible] = useState(true);

  const [getEnvironmentQuery, {error: getEnvironmentError, loading: getEnvironmentLoading, data: getEnvironmentData}] = useEnvironmentLazyQuery({pollInterval: POLL_ENVIRONMENT_INTERVAL});
  const [getServiceQuery, {error: getServiceError, data: getServiceData}] = useServiceLazyQuery({fetchPolicy: 'network-only'});
  const [getDeployments, {error: getDeploymentError, loading: getServiceLoading, data: getDeploymentData}] = useDeploymentsLazyQuery({fetchPolicy: 'network-only'});
  
  const dispatch = useDispatch();
  const env = useSelector((state: RootState) => state.env.value);

  const getServiceDetails = (serviceId: string) => {
    getServiceQuery({variables: {serviceId: serviceId}});
    getDeployments({variables: {environmentId: env.envId, projectId: env.projectId, serviceId: serviceId}});
  };

  useEffect(() => {
    console.log(env)
    getEnvironmentQuery({variables: {environmentId: env.envId}});
  }, [env.envId, getEnvironmentQuery]);

  useEffect(() => {
    if (getDeploymentError) {
      console.log(getDeploymentError);
    }
  }, [getDeploymentError]);

  useEffect(() => {
    if (getServiceError) {
      console.log(getServiceError);
    }
  }, [getServiceError]);

  useEffect(() => {
    if (getEnvironmentError) {
      if (env.auth && env.envId && env.projectId && !env.authError) {
        dispatch(setEnv({
          envId: env.envId, 
          projectId: env.projectId, 
          auth: env.auth,
          authError: true
        }));
      }
      console.log(getEnvironmentError)
    } else if (getEnvironmentData) {
      if (env.authError) {
        dispatch(setEnv({...env, authError: false}));
      }
      const newServices = getEnvironmentData.environment.serviceInstances.edges.map((edge) => {
        return  {
          serviceIcon: edge.node.latestDeployment?.service.icon,
          serviceID:  edge.node.serviceId,
          deleted: edge.node.latestDeployment?.service.deletedAt ? true : false,
          status: edge.node.latestDeployment?.status,
          source: {
            image: edge.node.source?.image,
            repo: edge.node.source?.repo
          }
        }
      });
      setServices(newServices.filter((serv) => serv.deleted != true));
    }
  }, [getEnvironmentError, getEnvironmentData, getEnvironmentLoading]);

  return (
        <View style={styles.container}>
          <DestructiveChangesModal 
            serviceId={getServiceData?.service.id}
            isModalVisible={isDestructiveModalVisible}
            setIsModalVisible={setIsDestructiveModalVisible}
          />
          <EnvironmentModal 
            isVisible={isEnvironmentModalVisible}
            setIsVisible={setIsEnvironmentModalVisible}
          />
          <ContainerGrid 
            services={services}
            getServiceDetails={getServiceDetails} 
          />
          <CreateContainerButton onPressFunction={() => navigation.navigate("CreateContainerScreen")}/>
          
          <ContainerDetailsSheet 
            service={getServiceData?.service}
            onDeleteButtonPress={() => setIsDestructiveModalVisible(true)}
            deployments={getDeploymentData?.deployments}
          />
          
          <InfoSquareButton onPressFunction={()=>setIsEnvironmentModalVisible(true)}/>
        </View>
      )
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
    height: '15%',
    borderRadius: 5,
  },
  container: {
    flex: 1,
    backgroundColor: "#24292e",
    justifyContent: "center",
    alignItems: "center"
  },
  credentialsIssue: {
    marginBottom: 5,
    alignSelf: "center",
    justifyContent: "center",
    alignContent: "center",
  },
  destructiveModalContent: {
    flexDirection: "column",
    backgroundColor: '#fafbfc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    height: "35%",
  },
  input: {
    borderWidth: 1,
    borderColor: '#c080f0',
    borderRadius: 10,
    padding: 10,
    width: "100%",
    marginBottom: 10,
    marginTop: 10,
    color: "#fafbfc"
  },
  inputDescription: {
    marginBottom: 5,
    color: "#fafbfc",
  },
  inputModalContent: {
    flexDirection: "column",
    alignSelf: "center",
    borderRadius: 8,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    height: "35%",
    width: "80%",
  },
  modalText: {
    width: '85%', // Making the button wide
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    textAlignVertical: 'center',
  },
  submitButton: {
    alignSelf: "center",
    backgroundColor: "#c080f0",
    width: "30%",
    borderRadius: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#2b3137',
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: "#2b3137"
  },
});

export default HomeScreen;