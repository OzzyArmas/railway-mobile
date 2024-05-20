import React, {useState} from "react";
import { Pressable, StyleSheet } from "react-native";
import Add from "../../../assets/svg/add.svg";

const CreateContainerButton = ({ onPressFunction }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable 
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={{...styles.pressable, backgroundColor: isPressed ? "#2b3137" : "#c080f0" }}
      onPress={() => onPressFunction()}
    >
      <Add/>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressable: {
    position: "absolute",
    top: "75%",
    left: "80%",
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    width: 53,
    height: 53,
    borderRadius: 25,
  },
});

export default CreateContainerButton;
