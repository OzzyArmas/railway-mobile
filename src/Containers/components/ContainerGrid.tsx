// GridScreen.tsx

import React, { useEffect, useRef, useState } from 'react';
import { View, PanResponder, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import Svg, { SvgUri, Rect, Line, G, ForeignObject } from 'react-native-svg';
import { MinServiceInfo } from '../../common/types';
import DefaultService from "../../../assets/svg/default-service.svg";
import GithubIcon from "../../../assets/svg/github-icon.svg";
import Timer from "../../../assets/svg/timer.svg";
import Alert from "../../../assets/svg/alert.svg";

interface Box {
  icon: any;
  id: string;
  x: number;
  y: number;
}

const BOX_HEIGHT = 100;
const BOX_WIDTH = 100;
const INIT_X = 350;
const INIT_Y = 250;
const ICON_HEIGHT = 24;
const ICON_WIDTH = 24;

interface GridParams {
  services: MinServiceInfo[],
  getServiceDetails({}: any)
}

const ContainerGrid = ({ services, getServiceDetails }: GridParams ) => {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const pan = useRef(new Animated.ValueXY({x: INIT_X, y: INIT_Y})).current;
  
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([
        null,
        { dx: pan.x, dy: pan.y },
      ], {useNativeDriver: false}),
      onPanResponderGrant: () => {
        pan.extractOffset();
    },
    })
  ).current;

  const iconSelect = (service: MinServiceInfo) => {
    if (service.status == "FAILED" || service.status == "CRASHED") {
      return <Alert/>
    } else if (service.status != "SUCCESS") {
      return <Timer/>
    }
    if (service.serviceIcon) {
      return service.serviceIcon
    } else if (service.source.repo) {
      return <GithubIcon/> // replace for image icon
    } else {
      return <DefaultService/>
    }
  }

  useEffect(() => {
    const newBoxes = services.map((service, index) => {
      const maxDim = Math.ceil(Math.sqrt(services.length)) 
      let icon = iconSelect(service)
      const newBox = {
        icon: icon,
        id: service.serviceID as string,
        y: (index % maxDim) * BOX_HEIGHT * 2, x: Math.floor(index / maxDim) * BOX_WIDTH * 2 
      }
      return newBox
    })
    setBoxes(newBoxes)
  },[services])

  const renderGridLines = () => {
    const gridLines: any[] = [];
    for (let i = 0; i <= 20; i++) {
      gridLines.push(
        <Line
          key={`vertical-${i}`}
          x1={i * BOX_HEIGHT}
          y1={0}
          x2={i * BOX_HEIGHT}
          y2={1000}
          stroke="#2b3137"
          strokeWidth="1"
        />
      );
      gridLines.push(
        <Line
          key={`horizontal-${i}`}
          x1={0}
          y1={i * BOX_WIDTH}
          x2={1000}
          y2={i * BOX_WIDTH}
          stroke="#2b3137"
          strokeWidth="1"
        />
      );
    }
    return gridLines;
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        }}
        {...panResponder.panHandlers}
      >
        <Svg height="1000" width="1000">
          {renderGridLines()}
          {boxes.map((box, index) => (
            <G key={index}>
            <Rect
              x={box.x}
              y={box.y}
              height={BOX_HEIGHT}
              width={BOX_WIDTH}
              fill="#2b3137"
              rx={5}
              ry={5}
              stroke={"#c080f0"}
              strokeWidth={2}
              onPress={()=>{getServiceDetails(box.id)}}
            />
            <ForeignObject x={box.x + BOX_WIDTH / 2 - ICON_WIDTH / 2} y={box.y + BOX_HEIGHT / 2 - ICON_HEIGHT / 2}>
              {typeof(box.icon) === "string" ? <SvgUri width={ICON_WIDTH} height={ICON_HEIGHT} uri={box.icon}/> : box.icon}
            </ForeignObject>
            </G>
          ))}
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    padding: 10,
    backgroundColor: 'green',
    borderRadius: 5,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ContainerGrid;