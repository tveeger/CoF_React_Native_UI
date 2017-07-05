npm install --save ethjs
npm install --save ethjs-provider-http
http://npm.taobao.org/package/ethjs-provider-http

*******Android-Studio**********
1. console:
from ~/:
./studio.sh
or
~/Programs/android-studio/bin/studio.sh

2. console:
cd ~/react_native/Entbox3
react-native start (or with --reset-cache)

react-native run-android (geeft foutmelding: java.lang.UnsupportedClassVersionError: com/android/build/gradle/AppPlugin : Unsupported major.minor version 52.0)


3. console Rinkeby:
Two options: 1: Geth running on localhost. 2. via Infura.io. Change r.16-r.17 in Tokeninfo.js

geth --fast --cache 1024 --networkid=4 --datadir=~/.ethereum/rinkeby --shh --rpc --rpcaddr "0.0.0.0" --rpcapi "db,net,eth,web3,shh,personal" --rpcport 8545 --rpccorsdomain "*"

Or:
set provider = 'https://rinkeby.infura.io/'

Libraries used:
react-navigation
react-native-vector-icons/FontAwesome
ethjs-provider-http
ethjs-query
ethjs-rpc
ethjs-unit
ethjs-abi
truffle-contract
bn.js
fs-extra
peer-up

Hosted server Mainnet: http://45.32.186.169:8545

Pallet:
http://www.colourlovers.com/palette/4511859/Anthropomorphized
D3C8B2 	warm light grey
BCB3A2	lok sabha
A0B5C8	Glassy Grey 2
8192A2	9th
2D4866	PennyBlue