import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger, renderers } from 'react-native-popup-menu';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const PlusButtonWithMenu = () => {
    const navigation = useNavigation();
  return (
    <Menu>
        <MenuTrigger>
            <Ionicons name={'add-outline'} color="black" size={30} />
        </MenuTrigger>
        <MenuOptions>
            <MenuOption style={{flex:1,flexDirection:"row",flexWrap:"wrap"}} onSelect={() => navigation.navigate('NewUserScreen')}>
            <Ionicons style={{margin:8}} name={"person-add-outline"} color="black" size={20}/>
            <Text style={{ padding: 10 }}>Nuevo Cliente</Text>
            </MenuOption>
            <MenuOption style={{flex:1,flexDirection:"row",flexWrap:"wrap"}} onSelect={() => navigation.navigate('NewAirScreen')}>
            <Ionicons style={{margin:8}} name={"snow-outline"} color="black" size={20}/>
            <Text style={{ padding: 10 }}>Nuevo Aire</Text>
            </MenuOption>
           
        </MenuOptions>
    </Menu>
  );
};

export default PlusButtonWithMenu;
