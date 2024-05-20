import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppRegistry, StyleSheet, Text, View } from 'react-native';
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import CreateContainerScreen from './src/screens/CreateContainerScreen';
import { Provider, useSelector } from 'react-redux';
import { RootState, store } from './src/store/store';
import { Env } from './src/reducers/env-reducer';

const serverPath = "https://backboard.railway.app/graphql/v2";

const Stack = createStackNavigator()
// Initialize Apollo Client

export default function App() {  
  return (
    <Provider store={store}>
      <ApolloProviderWrapper/>
    </Provider>
  );
}

function ApolloProviderWrapper() {
  const link = new HttpLink({ uri: serverPath });
  const env = useSelector((state: RootState) => state.env.value);
  const setAuthorizationLink = setContext((_, previousContext) => ({
    headers: {
      ...previousContext.headers,
      authorization: `Bearer ${ env.auth }`
    }
  }));
  const client = new ApolloClient({
    link: setAuthorizationLink.concat(link),
    cache: new InMemoryCache(),
  });
  return (
    <ApolloProvider client={client}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Home" screenOptions={{headerShown: true}}>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="CreateContainerScreen"
              component={CreateContainerScreen}
              options={
                {
                headerTitle: "Deploy Service",
                headerTitleStyle: {
                  color: "#fafbfc",
                },
                headerTintColor: "#c080f0",
                headerStyle: {
                  backgroundColor: "#24292e",
                  }
                }
              }
            />
          </Stack.Navigator>
          <StatusBar style="light" />
        </NavigationContainer>
      </ApolloProvider>
  );
}

AppRegistry.registerComponent('MyApplication', () => App);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

