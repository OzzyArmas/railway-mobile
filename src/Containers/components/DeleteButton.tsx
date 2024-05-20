import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

const DeleteButton = ({ onPress }) => {
    const handleOnPress = () => {
      onPress();
    };
    return (
        <Pressable style={styles.button} onPress={handleOnPress}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      );
  };

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    width: "100%",
    height: "100%"
  },
  deleteText: {
    color: 'white',
    fontSize: 16,
  },
});

export default DeleteButton;