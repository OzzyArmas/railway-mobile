import React, {useState} from "react";
import { Pressable, StyleSheet } from "react-native";
import Info from "../../../assets/svg/info-square.svg";

const InfoSquareButton = ({ onPressFunction }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable 
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={{...styles.pressable, backgroundColor: isPressed ? "#2b3137" : "#fafbfc" }}
      onPress={() => onPressFunction()}
    >
      <Info />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressable: {
    position: "absolute",
    top: "10%",
    left: "80%",
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    width: 49,
    height: 50,
    borderRadius: 25,
  },
});

export default InfoSquareButton;
