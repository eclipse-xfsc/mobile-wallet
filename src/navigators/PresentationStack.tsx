import React, { useEffect } from 'react'
import { useIsFocused, useNavigation } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Screens, PresentationStackParams } from '../types/navigators'
import Presentation from '../screens/Presentation/Presentation'
import PresentationList from '../screens/Presentation/PresentationList'
import PresentationDisclosure from '../screens/Presentation/PresentationDisclosure'
import PresentationSuccess from '../screens/Presentation/PresentationSuccess'
import PresentationRequest from '../screens/Presentation/PresentationRequest' // <--- dein neuer Screen
import PresentationCredentialSelection from '../screens/Presentation/PresentationCredentialSelection'
const Stack = createStackNavigator<PresentationStackParams>()

const PresentationStack = () => {
  const navigation = useNavigation()
  const isFocused = useIsFocused()

  useEffect(() => {
    if (isFocused) {
      navigation.reset({
        index: 0,
        routes: [{ name: Screens.PresentationList as never }],
      })
    }
  }, [isFocused, navigation])

  return (
    <Stack.Navigator
      initialRouteName={Screens.PresentationList}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name={Screens.PresentationList}
        component={PresentationList}
      />
      <Stack.Screen
        name={Screens.PresentationRequest}
        component={PresentationRequest}
      />
      <Stack.Screen
        name={Screens.PresentationCredentialSelection}
        component={PresentationCredentialSelection}
      />
      <Stack.Screen
        name={Screens.PresentationDisclosure}
        component={PresentationDisclosure}
      />
      <Stack.Screen
        name={Screens.PresentationSuccess}
        component={PresentationSuccess}
      />
      <Stack.Screen
        name={Screens.Presentation}
        component={Presentation}
      />
    </Stack.Navigator>
  )
}

export default PresentationStack
