# PCM App

## Code

This project utilizes [Aries Framework Javascript (AFJ)](https://github.com/hyperledger/aries-framework-javascript) and [indy-sdk-react-native](https://github.com/hyperledger/indy-sdk-react-native).

## Project State

### Platform

PCM currently is built on React Native 0.66.4

As of now PCM targets Android API 30.0.2

iOS targets iOS 10.0+.PCM can only be run on physical devices as of right now.

## Install

Pre Settings: 
- Follow this [instructions](https://rlogicaltech.medium.com/how-to-install-react-native-on-mac-step-by-step-guide-1ac822aedd4f) 
- Fix Flipper File if required (https://github.com/facebook/react-native/issues/43335#issuecomment-1980285308)

1. React Native Setup:
   - React Native installation instructions are documented [here](https://reactnative.dev/docs/environment-setup).
   - (iOS) Install [Cocoa Pods](https://cocoapods.org/)
   Note: CocoaPod Installation may require to ship arround the pre installed ruby installation. Follow please this instructions to upgrade to the latest over brew (https://mac.install.guide/ruby/13), after that drb can be upgraded by gem update drb, and after that cocoa pods can be installed via gem install cocoapods
2. Clone the PCM repo and install its dependencies:
   ```sh
   git clone https://gitlab.eclipse.org/eclipse/xfsc/pcm/app.git
   yarn install
   ```
3. (iOS) iOS specific install:
   - Install iOS Pods:
     ```sh
     cd ios
     pod install
     ```
   - In the /ios directory, open the project workspace file in Xcode.
     Once the project is open, navigate to the project's Signing & Capabilities tab and apply your personal Apple Developer Account or your organization's team to target PCM 
   - Adjust the bundle identifier if needed.

## Configure

In the root directory add an `.env.development` file containing:
MEDIATOR_URL=https://www.example.com/mediator


## Run

- Launch the metro bundler:
  ```sh
  yarn start
  ```
- Open a second terminal and run:
  - (Android)
    ```sh
    yarn android:dev
    ```
  - (iOS)
    ```sh
    yarn ios:dev
    ```
  - (iOS) Via Xcode:
    Choose your physical iOS device as the destination. Click the "Play" button to Build and Run.

**NOTE: PCM does not work on iOS simulators** -- use a physical device instead.

### Advanced Configuration

#### Mediator

In order to use PCM, you must have a mediator to use with the app. PCM is configured to use 'Implicit' mediation and requires a mediator that supports the [coordinate-mediation protocol](https://github.com/hyperledger/aries-rfcs/tree/main/features/0211-route-coordination).

## Use Siera

Siera is a tool that allows you to interact with the Aries Framework Javascript (AFJ) agent. You can use Siera to create a connection, issue a credential, and more. To use Siera, follow the instructions in the [Siera Documentation](https://docs.siera-cli.animo.id/).

After you have Siera installed, you can use it to interact with PCM, here is an example of how to create a connection and issue a credential:

```sh
  siera automate credential-offer -s
```

## Troubleshooting

#### Hot Reloading

Hot reloading may not work correctly with instantiated Agent objects. Reloading (`r`) or reopening the app may work. Any changes made to native modules require you to re-run the compile step.

### Dependency Issues, Native Module Linking Issues, or Usage Issues

If you end up changing dependencies or structures, you may need to perform the following steps:

#### Android

```sh
rm -rf node_modules
yarn install
```

Clean the Android build:

```sh
cd android
./gradlew clean
cd ..
```

Start and clean the Metro cache:

```sh
yarn start
```

In your second terminal, you can now run:

```sh
yarn android
```

## Building local android apk file in debug mode

Create .env file with environment variables

Run command in root folder of app project

```sh
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
```

Go to path `android` and run the command

```sh
./gradlew assembleDebug
```

As a result you will get apk file in `./android/app/build/outputs/apk/[production|development]`


## How to prepare next application android release

Put correct password for android upload key in the file `android/gradle.properties` for `MYAPP_UPLOAD_STORE_PASSWORD` and `MYAPP_UPLOAD_KEY_PASSWORD`

Run command in root folder of app project

```sh
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
```

Go to path `android` and run the command

```sh
./gradlew bundleRelease
```

After that you will find `app-release.aab` file in `./android/app/build/outputs/bundle/release` folder

## Useful commends

`./gradlew signingReport` - In order to find out what's wrong with apk signing you can use gradle's signingReport command.

## Latest Android version
<hr/>

[Android PCM](https://vereign0-my.sharepoint.com/:f:/g/personal/kalin_canov_vereign_com/EiwSfVWCOllDiSC57_DE_xABBVKkiJYx_tANEvbJiI9lGQ?e=3VBnIX)

## GDPR
<hr/>

[GDPR](GDPR.md)

### Note
`Man in the mid` security concern it will be addressed in Phase II. One of the discussed options is to use [TRAIN API](https://train.trust-scheme.de/info/) 

## Dependencies
<hr/>

[Dependencies](package.json)

## License
<hr/>

[Apache 2.0 license](LICENSE)
