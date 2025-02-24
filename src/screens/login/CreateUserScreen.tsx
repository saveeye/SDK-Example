import auth from '@react-native-firebase/auth';
import { useState } from 'react';
import {
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export const CreateUserScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function createUser() {
    auth()
      .createUserWithEmailAndPassword(username, password)
      .then(() => {
        console.log('User created');
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text>Create User</Text>
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
        <Button title="Create user" onPress={createUser} />
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
