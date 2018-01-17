react-native init -project name-

copy src dir in root folder

add in package.json under "dependencies":

	"ethers": "^2.1.3",
	
	"react-native-qrcode": "^0.2.6",
	
    "react-native-radio-buttons": "^1.0.0",
    
    "react-native-vector-icons": "^4.4.2",
    
    "react-navigation": "^1.0.0-beta.19"
    
cd -project name-
	
npm install

react-native link

react-native start

connect mobile

prompt-2 (Android):

cd -project name-

adb devices

adb reverse tcp:8081 tcp:8081

react-native run-android

Test Token on Rinkeby

Birdland (BLT): 0x54817cFEB229B7ABf8190E8E4AA4eD5E3181f712
