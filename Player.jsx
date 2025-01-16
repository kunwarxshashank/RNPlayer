import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, BackHandler, Modal, } from 'react-native';
import Video, { DRMType } from 'react-native-video';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as NavigationBar from 'expo-navigation-bar';
import Slider from '@react-native-community/slider';
import PlayerModal from 'app/components/PlayerModal';
import { SettingsContext } from '../ContextApi/SettingsContext';  //using context

const Player = ({ route }) => {

  const videoRef = useRef(null);
  const [volume, setVolume] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMute, setIsMute] = useState(enableAudio);
  const [resizeMode, setresizeMode] = useState("cover");
  const [isBuffering, setIsBuffering] = useState(false);
  const [videoPressed, setVideoPressed] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [selectedAudioTrack, setselectedAudioTrack] = useState(0);
  const [selectedVideoTrack, setselectedVideoTrack] = useState(0);
  const [selectedTextTrack, setselectedTextTrack] = useState(0);
  const [AllAudioTracks, setAllAudioTracks] = useState([]);
  const [AllVideoTracks, setAllVideoTracks] = useState([]);
  const [AllTextTracks, setAllTextTracks] = useState([]);
  const [AudioModalVisible, setAudioModalVisible] = useState(false);
  const [bgplay, setbgplay] = useState(false);


  const { 
    url,
    referer,
    origin,
    cookie,
    userAgent,
    drmKey,
    drmType } = route.params; //params query optional


  const {
    enableAutoPlay,
    enableAudio,
    enablePip,
    enablelandscape,
    addonsdefault,
    cinemadefault,
  } = useContext(SettingsContext);

  useEffect(() => {
    console.log(drmType);
    console.log("Is audio: ",enableAudio);
    

    // console.log("Audio Tracks", AllAudioTracks);
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


  const handlePlayPause = () => { // Play/Pause btn
    setIsPlaying(!isPlaying);
  };

  const skip = (forward = true) => {
    const newPosition = position + (forward ? 10000 : -10000);
    videoRef.current.seek(newPosition / 1000); // Seek accepts seconds
    setPosition(newPosition);
  };

  const formatDuration = (millis) => { //Timestamp video
    const hours = Math.floor(millis / 3600000);
    const minutes = Math.floor((millis % 3600000) / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${hours > 0 ? hours + ':' : ''}${hours > 0 && minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const onProgress = (data) => {
    setPosition(data.currentTime * 1000); // Convert seconds to milliseconds
  };

  const onBuffer = ({ isBuffering }) => { //Buffers
    setIsBuffering(isBuffering);
  };

  const onLoad = (data) => {
    setDuration(data.duration * 1000); // Convert seconds to milliseconds
  };

  const handleMute = () => {
    setIsMute(false);
  }

  const handleUnmute = () => {
    setIsMute(true);
  }
  const handleZoomIn = () => {
    setresizeMode("cover");
  }
  const handleZoomOut = () => {
    setresizeMode("none");
  }

  const handleModal = () => {
    handlePlayPause();
    setAudioModalVisible(true);
  }

  const handlebgplay = () => {
    setbgplay(true);
  }

  const applyPlayerChanges = () => {
    handlePlayPause();
    setAudioModalVisible(false);
  }

  const cancelPlayerChanges = () => {
    handlePlayPause();
    setAudioModalVisible(false);
  }


  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <PlayerModal
        visible={AudioModalVisible}
        audioTracks={AllAudioTracks}
        videoTracks={AllVideoTracks}
        textTracks={AllTextTracks}
        selectedAudioTrack={selectedAudioTrack}
        selectedVideoTrack={selectedVideoTrack}
        selectedTextTrack={selectedTextTrack}
        onSelectAudio={(index) => setselectedAudioTrack(index)}
        onSelectVideo={(index) => setselectedVideoTrack(index)}
        onSelectText={(index) => setselectedTextTrack(index)}
        onApply={applyPlayerChanges}
        onCancel={cancelPlayerChanges}
      />
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
          
          {...(drmType && {
            drm: {
              type: drmType,
              licenseServer: drmKey,
            },
          })}

          style={styles.video}
          muted={isMute}
          playInBackground={bgplay}
          resizeMode={resizeMode}
          paused={!isPlaying}
          volume={volume}
          onProgress={onProgress}
          onBuffer={onBuffer}
          // onLoad={onLoad}
          onLoad={(videoInfo) => {
            console.log("Video info: ", videoInfo)
            setAllAudioTracks(videoInfo.audioTracks);
            setAllVideoTracks(videoInfo.videoTracks);
            setAllTextTracks(videoInfo.textTracks);

          }}

          selectedAudioTrack={{
            type: "index",
            value: selectedAudioTrack
          }}

          selectedVideoTrack={{
            type: "resolution",
            value: selectedVideoTrack
          }}

          selectedTextTrack={{
            type: "index",
            value: selectedTextTrack // Replace 0 with the actual index of the subtitle track
          }}

          textStyle={{
            color: "red", // Subtitle text color
            fontSize: 20, // Subtitle font size
            fontFamily: "Arial", // Custom font family
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Subtitle background color
          }}

          onError={(error) => console.error('Video Error:', error)}
        />

        <TouchableOpacity
          onPress={() => setVideoPressed(!videoPressed)}
          style={[styles.controlsarea, { backgroundColor: videoPressed ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)' }]}>

          {isBuffering ? (
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
                  name={isPlaying ? 'pause-circle-filled' : 'play-circle-filled'}
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


          {!isBuffering && (
            <View style={[styles.footercontrols, { opacity: videoPressed ? 1 : 0 }]}>

              {
                isMute ? (
                  <TouchableOpacity onPress={handleMute}>
                    <MaterialIcons name="volume-off" color="white" size={30} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={handleUnmute}>
                    <MaterialIcons name="volume-up" color="white" size={30} />
                  </TouchableOpacity>
                )

              }


              <TouchableOpacity onPress={handleModal}>
                <MaterialIcons name="video-settings" color="white" size={30} />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleModal}>
                <MaterialIcons name="speed" color="white" size={30} />
              </TouchableOpacity>

              {bgplay ? (
                <TouchableOpacity onPress={() => setbgplay(false)}>
                  <MaterialCommunityIcons name="headphones-off" color="white" size={30} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setbgplay(true)}>
                  <MaterialCommunityIcons name="headphones" color="white" size={30} />
                </TouchableOpacity>
              )}


              {
                resizeMode === "cover" ? (
                  <TouchableOpacity onPress={handleZoomOut}>
                    <MaterialIcons name="zoom-out-map" color="white" size={30} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={handleZoomIn}>
                    <MaterialIcons name="zoom-in-map" color="white" size={30} />
                  </TouchableOpacity>
                )
              }



            </View>
          )}

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
    bottom: 80,
  },
  sliderbar: {
    flex: 1,
  },
  slidertext: {
    color: 'white',
  },
  footercontrols: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: 'absolute',
    width: "70%",
    bottom: 25,
  }
});

export default Player;
