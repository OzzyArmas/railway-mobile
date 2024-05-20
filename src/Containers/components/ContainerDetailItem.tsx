import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useDeploymentRedeployMutation, useDeploymentRollbackMutation } from '../../generated/graphql';

const getUpdatedMessage = (updatedAt: string | undefined) => {
  if (!updatedAt) {
    return ""
  }
  
  let timeDiff = Math.abs(Date.parse(updatedAt) - Date.now()) / (1000 * 3600 * 24)
  if (timeDiff > 1) {
    return Math.floor(timeDiff) + " days ago"
  }
  timeDiff = timeDiff * 24
  if (timeDiff > 1) {
    return Math.floor(timeDiff) + " hours ago"
  }
  timeDiff = timeDiff * 60
  if (timeDiff > 2) {
    return Math.floor(timeDiff) + " minutes ago"
  }
  timeDiff = timeDiff * 60
  return Math.floor(timeDiff) + " seconds ago"
}


export const ServiceDetailItem = ({ title, updatedAt, deployment }) => {
  const [deploymentRedeploy, {error, loading, data}] = useDeploymentRedeployMutation();
  const [borderColor, setBorderColor] = useState("");
  
  const handleRedeploy = () => {
    deploymentRedeploy({variables: {deploymentId: deployment.node.id}})
  }
  
  useEffect(() => {
    switch(deployment?.node?.status as string) {
      case 'SUCCESS':
        setBorderColor("#61ff43");
        break;
      case 'FAILED':
        setBorderColor("red");
        break;
      case 'CRASHED':
        setBorderColor("red");
        break;
      default:
        setBorderColor("black");
        break;
    }
  }, [deployment?.node?.status, setBorderColor])

  useEffect(() =>{
    if (error) {
      console.log(error);
    }
  },[error])
  
  return (
    <View style={[styles.serviceDetails, {borderWidth: 2, borderColor: borderColor}]}>
      <View style={styles.containerLeft}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>ID: {deployment?.node.id.slice(0,8) }</Text>
        <Text style={styles.subtitle}>{"Updated: " + getUpdatedMessage(updatedAt) }</Text>
      </View>
      {deployment?.node?.canRedeploy && 
      <View style={styles.containerRight}>
        <Pressable style={styles.pressable} onPress={handleRedeploy}>{loading ? <ActivityIndicator/> : <Text>Redeploy</Text>}</Pressable>        
      </View>}
    </View>
  );
};

export const DeploymentDetailItem = ({ deployment }) => {    
  const [deploymentRollback, {error, loading, data}] = useDeploymentRollbackMutation();

  const handleRollback = () => {
    deploymentRollback({variables: {deploymentId: deployment.node.id}})
  }
  
  useEffect(() =>{
    if (error) {
      console.log(error);
    }
  },[error])
  
  return (
    <View style={{...styles.deploymentDetails}}>
      <View style={styles.containerLeft}>
      <Text style={styles.title}>{deployment?.node.status}</Text>
      <Text style={styles.subtitle}>ID: {deployment?.node.id.slice(0,8) }</Text>
        <Text style={styles.subtitle}>{"Updated: " + getUpdatedMessage(deployment?.node?.updatedAt) }</Text>
      </View>
      {deployment?.node?.canRollback && 
      <View style={styles.containerRight}>
        <Pressable style={styles.pressable} onPress={handleRollback}>{loading ? <ActivityIndicator/> : <Text>Rollback</Text>}</Pressable>        
      </View>}
  </View>

  );
};

const styles = StyleSheet.create({
  containerRight: {
    flexDirection: 'column',
    backgroundColor: '#fafbfc',
    width: "30%",
    alignItems:'center',
    justifyContent: 'center',
    alignContent: 'center',
    borderRadius: 8,
    borderColor: "#c080f0",
    borderWidth: 1,
  },
  containerLeft: {
    flexDirection: 'column',
    backgroundColor: '#fafbfc',
    paddingLeft: 10,
    width: "70%",
  },
  deploymentDetails: {
    flexDirection: 'row',
    backgroundColor: '#fafbfc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    width: "85%",
    height: "15%",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  pressable: {
    height: "100%",
    width: "100%",
    alignItems:'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#2b3137',
    marginBottom: 5,
  },
  serviceDetails: {
    flexDirection: 'row',
    marginBottom: 50,
    marginRight: 10,
    marginLeft: 10,
    backgroundColor: '#fafbfc',
    paddingRight: 10,
    paddingTop: 10, 
    paddingBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    width: "85%",
    height: "15%",
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
    color: "#2b3137"
  },
});