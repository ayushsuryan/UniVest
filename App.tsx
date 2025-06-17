import "./global.css"
import Landing from "./src/Pages/Landing";
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Signup from "./src/Pages/Signup";

const Stack = createNativeStackNavigator();
 
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Landing"
          component={Landing}
          options={{headerShown: false}}
        />
        <Stack.Screen name="Signup" component={Signup}  options={{headerShown: false}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}