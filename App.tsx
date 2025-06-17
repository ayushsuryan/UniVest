import "./global.css"
import { View } from "react-native";
import Landing from "./src/Pages/Landing";
 
export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Landing />
    </View>
  );
}