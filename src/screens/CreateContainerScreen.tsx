import React, { useEffect, useState, useCallback } from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    Button,
    StyleSheet,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useGithubReposLazyQuery, useTemplateLazyQuery, useGithubServiceCreateMutation, useImageServiceCreateMutation, useTemplateDeployMutation } from '../generated/graphql';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const DropdownMenu = ({ options, onSelect, option}) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity style={styles.dropdownHeader} onPress={() => setIsOpen(!isOpen)}>
          <Text style={{color: "#fafbfc"}}>{isOpen ? "▲  " + option: "▼  " + option}</Text>
        </TouchableOpacity>
        {isOpen && 
          <View style={styles.dropdownContent}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.option}
                onPress={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
              >
                <Text style={styles.dropdownText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        }
      </View>
    );
  };

const GIT = "Github Repo";
const DATABASE = "Database";
const DOCKER = "Docker Image";

const DEPLOYMENT_OPTIONS = ["Container Type", GIT, DATABASE, DOCKER]

const CreateContainerScreen = ({ navigation }) => {
  const [deploymentSelection, setDeploymentSelection] = useState('');
  // const [createBathroom, {loading, error, data}] = use();  
  const RenderBasedOnDeploymentOption = useCallback((option: string)=> {

    switch(option) {
      case GIT:
        return <DeployGithubRepo navigate={navigation.navigate}/>
      case DATABASE:
        return <DeployDB navigate={navigation.navigate}/>;
      case DOCKER:
        return <DeployDocker navigate={navigation.navigate}/>;
      default:
        return <></>;
      }
  }, []);


  return (
    <ScrollView style={styles.screen}>
        <View style={styles.container}>
          <View>
            <Text style={styles.inputDescription}>What do you need?</Text>
            <DropdownMenu
                options={DEPLOYMENT_OPTIONS}
                onSelect={(option) => setDeploymentSelection(option)}
                option={deploymentSelection || ""}
            />
          </View>
          {RenderBasedOnDeploymentOption(deploymentSelection)}
        </View>
    </ScrollView>
  );
};

const DeployDocker = ({ navigate }) => {
  const [submitted, setSubmitted] = useState(false);
  const [imagePath, setImagePath] = useState("");
  const [name, setName] = useState("");
  
  const [getGithubOptions, {error, data}] = useGithubReposLazyQuery();
  const [createService, {error: createServiceError, loading: createServiceLoading}] = useImageServiceCreateMutation();
  
  const env = useSelector((state: RootState) => state.env.value);

  const handleFormSubmit = () => {
    createService({
      variables: {
        image: imagePath,
        environmentId: env.envId,
        projectId: env.projectId,
        name: name
      }
    }).then((res) => {
      if (!res.errors) {
        setSubmitted(true);
      }
    })
    navigate("Home");
  }
  
  // for error logging, and first render call on getGithubOptions
  useEffect(() => {
    if (error) {
      console.log(error);
    } else { 
      getGithubOptions();
    }
    if (createServiceError) {
      console.log(createServiceError);
    }
  },[error, data, createServiceError]);

  // navigate to homescreen and reset vars
  useEffect(() => {
    if (submitted) {
      navigate("Home");
      setSubmitted(false);
    }
  },[submitted]);

  return (
    <View>
      <RepositoryTextInputs description={"Image Path:"} setValue={setImagePath} value={imagePath} required={true}/>
      <RepositoryTextInputs description={"Name:"} setValue={setName} value={name} required={false}/>
      <View style={styles.submitButton}>
        {createServiceLoading ? <ActivityIndicator/> : <Button color="#c080f0" title="Deploy" onPress={handleFormSubmit} />}
      </View>
    </View>
  )
}

const DeployGithubRepo = ({ navigate }) => {
  const [githubRepoName, setGithubRepoName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [branch, setBranch] = useState("");
  const [name, setName] = useState("");

  const [getGithubOptions, {error, data}] = useGithubReposLazyQuery();
  const [createService, {error: createServiceError, loading: createServiceLoading}] = useGithubServiceCreateMutation();
  
  const env = useSelector((state: RootState) => state.env.value);

  const handleFormSubmit = () => {
    createService({
      variables: {
        repo: githubRepoName,
        branch: branch,
        environmentId: env.envId,
        projectId: env.projectId,
        name: name ? name : null,
      }
    }).then((res) => {
      if (!res.errors) {
        setSubmitted(true);
      }
    })
    navigate("Home");
  }
  
  // for error logging, and first render call on getGithubOptions
  useEffect(() => {
    if (error) {
      console.log(error);
    } else { 
      getGithubOptions();
    }

    if (createServiceError) {
      console.log(createServiceError);
    }
  },[error, data, createServiceError]);

  // navigate to homescreen and reset vars
  useEffect(() => {
    if (submitted) {
      navigate("Home");
      setSubmitted(false);
    }
  },[submitted]);

  return (
    <View>
      <Text style={styles.inputDescription}>Select Github Repo</Text>
      <DropdownMenu
          options={data?.githubRepos ? data?.githubRepos.map((repo) => repo.fullName) : []}
          onSelect={(option) => {
            setGithubRepoName(option)
            setBranch(data?.githubRepos.filter((repo) => repo.fullName == option)[0]?.defaultBranch || "")
          }}
          option={githubRepoName || ""}
      />
      {githubRepoName && <RepositoryTextInputs description={"Branch:"} setValue={setBranch} value={branch} required={true}/>}
      {githubRepoName && <RepositoryTextInputs description={"Name:"} setValue={setName} value={name} required={false}/>}
      <View style={styles.submitButton}>
        {createServiceLoading ? <ActivityIndicator/> : <Button color="#fafbfc" title="Deploy" onPress={handleFormSubmit} />}
      </View>
    </View>
  )
}

const RepositoryTextInputs = ({ description, value, setValue, required }) => {
  return (
    <View>
      <Text style={styles.inputDescription}>{description}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          multiline
          placeholder={required ? "" : "(optional)"}
          autoCapitalize='none'
          placeholderTextColor={"#b7b8b9"}
        />
    </View>
  )
};



const POSTGRES = "Add PostgresSQL";
const REDIS = "Add Redis";
const MONGO = "Add MongoDB";
const MYSQL = "Add MySQL";

const DeployDB = ({ navigate }) => {
  const [db, setDB] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const dbOptions = [POSTGRES, REDIS, MONGO, MYSQL];

  const [getTemplate, {error, loading, data}] = useTemplateLazyQuery();
  const [templateDeploy, {error: templateDeployError, loading: templateDeployLoading, data: templateDeployData}] = useTemplateDeployMutation();

  const env = useSelector((state: RootState) => state.env.value);

  const handleFormSubmit = () => {
    if (data) {
      const services = data.template.services.edges.map((s) => {
        let variables = {};
        s.node.config.variables.forEach((variable) =>  {
          variables[variable.name] = variable.defaultValue;
        });

        const volumes = s.node.config.volumes.map((v) => {
          let vol = {
            mountPath: v.mountPath,
            name: v.name
          };
          return vol;
        });
        const service = {
          commit: null,
          hasDomain: s.node.config.domains?.filter((d) => d.hasServiceDomain).length > 0,
          healthcheckPath: null,
          id: s.node.id,
          isPrivate: null,
          name: s.node.config.name,
          owner: null,
          rootDirectory: null,
          serviceIcon: s.node.config.icon,
          serviceName: s.node.config.name,
          startCommand: s.node.config.deployConfig?.startCommand,
          tcpProxyApplicationPort: s.node.config.tcpProxies[0].applicationPort,
          template: s.node.config.source.image,
          variables: variables,
          volumes: volumes,
        };
        return service;
      });
      templateDeploy({
        variables: {
          environmentId: env.envId,
          projectId: env.projectId,
          templateCode: getTemplateCode(),
          services: services
        }
      }).then((res) => {
        if (!res.errors) {
          setSubmitted(true)
        }
      });
    }
  };
  
  const getTemplateCode = () => {
    switch(db) {
      case POSTGRES:
        return "postgres";
      case REDIS:
        return "redis";
      case MONGO:
        return "mongo";
      case MYSQL:
        return "mysql";
      default:
        return "postgres";
    }
  };

  useEffect(() => {
    if (error) {
      console.log(error);
    } else if (!loading) {
      const templateCode = getTemplateCode();
      getTemplate({variables: {code: templateCode}});
    }
  },[db, error, loading]);

  useEffect(() => {
    if (templateDeployError) {
      console.log(templateDeployError);
    } else if (templateDeployData) {
      console.log(templateDeployData.templateDeploy.projectId);
    }
  }, [templateDeployError, templateDeployData]);

  useEffect(() => {
    if (submitted) {
      navigate("Home");
      setSubmitted(false);
    }
  })
  return (
    <View>
      <Text style={styles.inputDescription}>Select DB</Text>
      <DropdownMenu
          options={dbOptions}
          onSelect={(option) => setDB(option)}
          option={db || ""}
      />
      <View style={styles.submitButton}>
        <Button color="#fafbfc" title="Deploy" onPress={handleFormSubmit} />
      </View>
      {templateDeployLoading && <ActivityIndicator/>}
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      top: "5%",
      left: "5%",
      backgroundColor: "#24292e",
    },
    dropdownText: {
      color: "#fafbfc"
    },  
    dropdownContainer: {
      marginBottom: 10,
    },
    dropdownHeader: {
      borderWidth: 1,
      borderColor: '#c080f0',
      borderRadius: 10,
      padding: 10,
      marginBottom: 5,
      width: "90%",
    },
    dropdownContent: {
      borderWidth: 1,
      borderColor: '#c080f0',
      borderRadius: 10,
      padding: 5,
      width: "90%",
    },
    inputDescription: {
        marginBottom: 5,
        color: "#fafbfc"
    },
    input: {
      borderWidth: 1,
      borderColor: '#c080f0',
      borderRadius: 10,
      padding: 10,
      width: "90%",
      marginBottom: 10,
      color: "#fafbfc"
    },
    option: {
      padding: 10,
    },
    screen: {
      backgroundColor: "#24292e",
      flex: 1,
    },
    submitButton: {
      marginTop: 10,
      backgroundColor: "#c080f0",
      width: "30%",
      borderRadius: 8,
    },
    switch: {
      display: "flex"  
    },
    
  });

export default CreateContainerScreen;