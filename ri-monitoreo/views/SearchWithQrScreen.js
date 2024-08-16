import React, { useState } from 'react';
import { Button, Text, View, TextInput, StyleSheet } from 'react-native';


function SearchWithQrScreen() {

    return (
      <View style={styles.container}>
        <Text>New User</Text>
      </View>
    );

  }

  export default SearchWithQrScreen;


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      backgroundColor: '#10232A',
    },
    input: {
      height: 40,
      width: '100%',
      borderColor: '#3D4D55',
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      marginBottom: 10,
      color: '#fff',
    },
    errorText: {
      color: 'red',
      marginBottom: 10,
    },
  });
  