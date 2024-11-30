import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, BackHandler } from 'react-native';
import Video from 'react-native-video';
import { MaterialIcons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';
import Slider from '@react-native-community/slider';

const Player = ({ route }) => {
  const videoRef = useRef(null);
  const [volume, setVolume] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [videoPressed, setVideoPressed] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  // taking parameters from other pages
  const { url, referer, origin, cookie, userAgent, drmKey, drmType } = route.params;
  

  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden"); // Hide bottom nav bar
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    const backAction = () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      NavigationBar.setVisibilityAsync("visible"); // Show navbar on exit
      return false; // Let back press navigate back
    };

    BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const skip = (forward = true) => {
    const newPosition = position + (forward ? 10000 : -10000);
    videoRef.current.seek(newPosition / 1000); // Seek accepts seconds
    setPosition(newPosition);
  };

  const formatDuration = (millis) => {
    const hours = Math.floor(millis / 3600000);
    const minutes = Math.floor((millis % 3600000) / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${hours > 0 ? hours + ':' : ''}${hours > 0 && minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const onProgress = (data) => {
    setPosition(data.currentTime * 1000); // Convert seconds to milliseconds
  };

  const onBuffer = ({ isBuffering }) => {
    setIsBuffering(isBuffering); // handle Buffering
  };

  const onLoad = (data) => {
    setDuration(data.duration * 1000); // Convert seconds to milliseconds
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <TouchableOpacity style={styles.playerarea}>

        <Video
          ref={videoRef}
          source={{
            uri: url,
            headers: {
              Referer: referer,
              Origin: origin,
              Cookie: cookie,
              'User-Agent': userAgent,
            },
          }}
          style={styles.video}
          resizeMode="cover"
          paused={!isPlaying}
          volume={volume}
          onProgress={onProgress}
          onBuffer={onBuffer}
          onLoad={onLoad}
          onError={(error) => console.error('Video Error:', error)}
        />

        <TouchableOpacity
          onPress={() => setVideoPressed(!videoPressed)}
          style={[styles.controlsarea, { backgroundColor: videoPressed ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)' }]}>

          {isBuffering ? ( // On Buffering shows buffering text you can add custom animation/lottie
            <View style={styles.bufferingContainer}>
              <Text style={{ color: 'white' }}>Buffering...</Text>
            </View>
          ) : (
            <View style={[styles.controls, { opacity: videoPressed ? 1 : 0 }]}>
              <TouchableOpacity onPress={() => skip(false)}>
                <MaterialIcons name="replay-10" size={50} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={handlePlayPause}>
                <MaterialIcons
                  name={isPlaying ? 'pause' : 'play-arrow'}
                  size={50}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => skip(true)}>
                <MaterialIcons name="forward-10" size={50} color="white" />
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.slidercontainer, { opacity: videoPressed ? 1 : 0 }]}>
            <Text style={styles.slidertext}>{formatDuration(position)}</Text>
            <Slider
              style={styles.sliderbar}
              value={position}
              onSlidingComplete={(value) => videoRef.current.seek(value / 1000)}
              minimumValue={0}
              maximumValue={duration}
              minimumTrackTintColor="red"
              maximumTrackTintColor="white"
            />
            <Text style={styles.slidertext}>{formatDuration(duration)}</Text>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playerarea: {
    width: '100%',
    height: '100%',
  },
  controlsarea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  bufferingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '40%',
  },
  slidercontainer: {
    flexDirection: 'row',
    width: '85%',
    position: 'absolute',
    bottom: 20,
  },
  sliderbar: {
    flex: 1,
  },
  slidertext: {
    color: 'white',
  },
});

export default Player;
