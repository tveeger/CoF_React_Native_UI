react-native init -project name-

copy src dir in root folder

cd -project name-

add in package.json under "dependencies":

	"ethers": "^3.0.29",
	
	"react-native-qrcode": "^0.2.7",
	
    "react-native-radio-buttons": "^1.0.0",
    
    "react-native-vector-icons": "^5.0.0",
    
    "react-navigation": "^1.0.0-beta.19"
    
    "react-native-rsa-native": "^1.0.24"
    
npm install

react-native link

rm ./node_modules/react-native/local-cli/core/__fixtures__/files/package.json

react-native start


connect mobile


prompt-2 (Android):

cd -project name-

adb devices

adb reverse tcp:8081 tcp:8081

react-native run-android



Test Token on Rinkeby

Chains of Freedom Token (DET): 0x492b5F5Eb71c56df81A0E92DAC653d3f0Bdfb896

