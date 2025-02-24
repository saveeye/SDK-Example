import auth from '@react-native-firebase/auth';
import type { NavigationProp } from '@react-navigation/native';
import { useState } from 'react';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AuthFlowNavigation } from '../../App';

type LoginScreenProps = {
  navigation: NavigationProp<any>;
};

export const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function login() {
    auth()
      .signInWithEmailAndPassword(username, password)
      .then(() => {
        console.log('User signed in!');
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text>Sign in to your account</Text>

        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
        />

        <Button title={'Sign In'} onPress={login} />
        <Button
          title={'Create account'}
          onPress={() => navigation.navigate(AuthFlowNavigation.CREATE)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
});
