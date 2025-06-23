import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert } from "react-native";
import { useDispatch } from "react-redux";
import { setSelectedUser } from "../../redux/slices/userSlice"; // Asegúrate de la ruta correcta
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const UserSearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();
  

  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.trim() === "") {
        setUsers([]);
        return;
      }

      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("Error", "Usuario no autenticado");
        return;
      }

      try {
        const response = await axios.get(
          "https://rosensteininstalaciones.com.ar/api/users/users/searchuser",
          {
            params: { searchTerm: searchTerm.trim() },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log(response.data);
        setUsers(response.data);
      } catch (error) {
        console.error("Error buscando usuarios:", error);
        Alert.alert("Error", "No se pudo obtener la lista de usuarios.");
      }
    };

    const delayDebounceFn = setTimeout(() => {
      searchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleUserSelect = (user) => {
    dispatch(setSelectedUser(user)); // Aquí se asigna correctamente
    setUsers([]);
    setSearchTerm("");
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Buscar Usuario</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 5,
          padding: 8,
          marginTop: 10,
        }}
        placeholder="Buscar usuario o empresa"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleUserSelect(item)}>
            <Text style={{ padding: 10, backgroundColor: "#ddd", marginTop: 5, borderRadius: 5 }}>
              {item.username}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default UserSearchComponent;
