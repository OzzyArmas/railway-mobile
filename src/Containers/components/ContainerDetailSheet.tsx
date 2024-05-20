import React, { useRef } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import {ServiceDetailItem, DeploymentDetailItem} from './ContainerDetailItem';
import DeleteButton from './DeleteButton';


const FirstDeleteButton = ({ onPress }) => {
  return (
      <View style={styles.button}>
        <DeleteButton onPress={onPress}/>
      </View>
    );
};

const ContainerDetailSheet = ({ service, deployments, onDeleteButtonPress}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  return (
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['75%', '15%']}
        index={1} 
        backgroundStyle={styles.bottomSheet}
        >
        <View style={styles.scrollViewContainer}> 
          <ScrollView contentContainerStyle={styles.contentContainer}>
            {service ? 
              <ServiceDetailItem 
                title={service.name}
                updatedAt={service.updatedAt}
                deployment={deployments?.edges[0]}
              /> :
              <Text style={styles.selectServiceText}>Please Select a Service</Text>
            }
            {deployments?.edges && deployments?.edges.filter((_, index) => index > 0).map((deployment, index) => <DeploymentDetailItem key={index} deployment={deployment}/>)}
          </ScrollView>
          {service && <FirstDeleteButton onPress={onDeleteButtonPress}></FirstDeleteButton>}
        </View>
      </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {
    backgroundColor: '#2b3137',
  },
  button: {
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
    height: '10%',
    borderRadius: 10,
  },
  contentContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#2b3137',
    width: '100%',
    height: '100%'
  },
  deleteText: {
    color: 'white',
    fontSize: 16,
  },
  selectServiceText: {
    color: "#fafbfc"
  },
  scrollViewContainer: {
    height: '550%',
  },
});

export default ContainerDetailSheet;