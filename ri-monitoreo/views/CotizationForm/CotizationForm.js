import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Checkbox,
  Divider,
  RadioButton,
  Menu,
  Portal,
  Modal,
  ActivityIndicator,
} from 'react-native-paper';
import { Dialog} from 'react-native-paper';
import axios from 'axios';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { ImagePicker } from 'expo';
import { Sharing } from 'expo';
import { Permissions } from 'expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';

function CotizationForm() {
  const [clientes, setClientes] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [maquinaSeleccionada, setMaquinaSeleccionada] = useState("No se especifica");
  const [materialesHabilitados, setMaterialesHabilitados] = useState(false);
  const [equiposHabilitados, setEquiposHabilitados] = useState(false);
  const [extraHabilitados, setExtraHabilitados] = useState(false);
  const [tipoCliente, setTipoCliente] = useState("existente");
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visibleMaquinaMenu, setVisibleMaquinaMenu] = useState(false);
  const [visibleEncargadoMenu, setVisibleEncargadoMenu] = useState(false);
  const [visibleTrabajoMenu, setVisibleTrabajoMenu] = useState(false);
  const [visibleEstadoMenu, setVisibleEstadoMenu] = useState(false);
  const [pdfUri, setPdfUri] = useState(null);
  const [showPdf, setShowPdf] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  // En la sección de estados del componente
    const [sucursalId, setSucursalId] = useState(null);
    const [sucursales, setSucursales] = useState([]);
    const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
    const [sucursalesCliente, setSucursalesCliente] = useState([]);
    const [visibleSucursalMenu, setVisibleSucursalMenu] = useState(false);
    const [cotizacionId, setCotizacionId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [validacionResumen, setValidacionResumen] = useState({ esValido: true, camposFaltantes: [] });
    const SUCURSAL_MANUAL_ID = "000000000000000000000000";
  

  const { control, handleSubmit, setValue,getValues, watch } = useForm({
    defaultValues: {
      estado: "pendiente",
      nombreTrabajo: "",
      descripcionTrabajo: "",
      manoDeObra: "",
      monto: "",
      montoIva: "",
      montoTotal: "",
      fechaTrabajo: new Date().toISOString().split('T')[0],
      numeroFactura: "",
      fechaFacturacion: new Date().toISOString().split('T')[0],
      encargadoTrabajo: "",
      correoContacto: "",
    },
  });

  const { fields: materialFields, append: appendMaterial, remove: removeMaterial } = useFieldArray({
    control,
    name: "materiales",
  });

  const { fields: equipoFields, append: appendEquipo, remove: removeEquipo } = useFieldArray({
    control,
    name: "equipos",
  });

  const { fields: extraFields, append: appendExtra, remove: removeExtra } = useFieldArray({
    control,
    name: "extra",
  });

  useEffect(() => {
    cargarClientes();
    console.log(clientes)
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status !== 'granted') {
      alert('Se necesitan permisos para acceder a la galería.');
    }
  };

  const cargarClientes = async () => {
      try {
          const token = await AsyncStorage.getItem('accessToken');
          console.log("CargarClientes",token)
      const response = await axios.get("https://rosensteininstalaciones.com.ar/api/users/users/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClientes(response.data);
      console.log(clientes);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Error", "No se pudieron cargar los clientes.");
    }
  };

  const cargarMaquinas = async (machineIds) => {
    try {
      const promises = machineIds.map((id) =>
        axios.get(`https://rosensteininstalaciones.com.ar/api/machines/${id}`)
      );
      const responses = await Promise.all(promises);
      setMaquinas(responses.map((res) => res.data));
    } catch (error) {
      console.error("Error fetching machines:", error);
    }
  };
 // Actualiza tu función de búsqueda
 const handleBuscarCliente = (text) => {
    setBusquedaCliente(text);
    console.log(text);
    if (text.length > 0) {
      const filtrados = clientes.filter(cliente =>
        cliente.username.toLowerCase().includes(text.toLowerCase())
      );
      setClientesFiltrados(filtrados);
      setMenuVisible(filtrados.length > 0);
    } else {
      setClientesFiltrados([]);
      setMenuVisible(false);
    }
  };

  const handleClienteSeleccionado = async (cliente) => {
    if (cliente && cliente._id) {
      setClienteSeleccionado(cliente);
      setValue("cliente", cliente.username || "");
      setValue("cuit", cliente.cuit || "No especificado");
      setValue("razonSocial", cliente.razonSocial || "No especificado");
      setValue("correoContacto", cliente.email || "No especificado");
  
      // Cargar sucursales del cliente
      setSucursalesCliente(cliente.sucursales || []); // Asegurar que siempre sea un array
      setSucursalSeleccionada(""); // Resetear selección
      if (cliente.machines && cliente.machines.length > 0) {
        await cargarMaquinas(cliente.machines); // Llama a la función para cargar las máquinas
      } else {
        setMaquinas([]); // Limpia el estado si no hay máquinas asociadas
      }

      // Código existente para máquinas...
    } else {
      setClienteSeleccionado(null);
      setMaquinas([]);
      setSucursales([]);
      setSucursalSeleccionada(null);
      setSucursalId(null);
    }
  };

const onSubmit = (data) => {
  const totalCost =
    (Number(data.manoDeObra) || 0) +
    (data.materiales?.reduce((acc, item) => acc + (Number(item.monto) || 0), 0) || 0) +
    (data.equipos?.reduce((acc, item) => acc + (Number(item.monto) || 0), 0) || 0) +
    (data.extra?.reduce((acc, item) => acc + (Number(item.monto) || 0), 0) || 0);

  const totalIva = totalCost * 1.21;

  const resumen = {
  Cliente: clienteSeleccionado?.username || data.clienteManual || 'No especificado',
  CUIT: clienteSeleccionado?.cuit || data.cuitManual || 'No especificado',
  RazonSocial: clienteSeleccionado?.razonSocial || data.razonSocialManual || 'No especificado',
  Correo: clienteSeleccionado?.email || data.correoContacto || 'No especificado',
  Sucursal:
    sucursalesCliente.find((s) => s._id === sucursalSeleccionada)?.nombre || data.direccionManual || 'No especificado',
  Máquina:
    maquinaSeleccionada === 'No se especifica'
      ? 'No se especifica'
      : `${maquinas.find((m) => m.id === maquinaSeleccionada)?.name || ''} ${maquinas.find((m) => m.id === maquinaSeleccionada)?.model || ''}`,
  NombreTrabajo: data.nombreTrabajo || 'No especificado',
  DescripciónTrabajo: data.descripcionTrabajo || 'No especificado',
  ManoDeObra: data.manoDeObra || '0',
  Materiales: data.materiales?.length ? `${data.materiales.length} ítems` : 'Vacío',
  Equipos: data.equipos?.length ? `${data.equipos.length} ítems` : 'Vacío',
  Extras: data.extra?.length ? `${data.extra.length} ítems` : 'Vacío',
  Total: totalCost.toFixed(2),
  TotalConIVA: totalIva.toFixed(2),
};

  setPreviewData(resumen);
  setModalVisible(true);
};

  const guardarCotizacion = async () => {
    const data = getValues(); 
    if ((!clienteSeleccionado?._id && !data.clienteManual?.trim()) || !data.nombreTrabajo.trim()) {
      alert("Error", "Debes seleccionar un cliente y especificar un nombre de trabajo.");
      return;
    }
     const totalCost =
    (Number(data.manoDeObra) || 0) +
    (data.materiales?.reduce((acc, item) => acc + (Number(item.monto) || 0), 0) || 0) +
    (data.equipos?.reduce((acc, item) => acc + (Number(item.monto) || 0), 0) || 0) +
    (data.extra?.reduce((acc, item) => acc + (Number(item.monto) || 0), 0) || 0);

  const totalIva = totalCost * 1.21;
    console.log(data)
     // Obtenemos la sucursal seleccionada
     const sucursalSeleccionadaObj = clienteSeleccionado?.sucursales?.find(
        (s) => s._id === sucursalSeleccionada
      );
  
      // Formatear dirección a partir de la sucursal seleccionada
      const direccionFormateada = sucursalSeleccionadaObj?.direccion
        ? `${sucursalSeleccionadaObj.direccion.calle || ""} ${
            sucursalSeleccionadaObj.direccion.numero || ""
          }, ${sucursalSeleccionadaObj.direccion.ciudad || ""}, ${
            sucursalSeleccionadaObj.direccion.provincia || ""
          }, ${sucursalSeleccionadaObj.direccion.codigoPostal || ""}`
        : data.direccionManual || "Dirección no especificada";
  
      if (!direccionFormateada || direccionFormateada === "Dirección no especificada") {
        alert("Error", "Debes proporcionar una dirección válida.");
        return;
      }

    const payload = {
      clienteId: clienteSeleccionado?._id || null,
      clienteManual: !clienteSeleccionado
        ? {
            nombre: data.clienteManual || "",
            cuit: data.cuitManual || "",
            razonSocial: data.razonSocialManual || "",
          }
        : null,
        sucursalId: sucursalSeleccionada || SUCURSAL_MANUAL_ID,
        ubicacion: {
            direccion: direccionFormateada,
            coordenadas: null, // Podés completar esto si tenés coordenadas luego
          },
        razonSocial: clienteSeleccionado?.razonSocial,
      correoContacto: clienteSeleccionado?.email || data.correoContacto,
      cuit: clienteSeleccionado?.cuit || data.cuitManual,
      maquinaId: maquinaSeleccionada === "No se especifica" ? null : maquinaSeleccionada,
      nombreTrabajo: data.nombreTrabajo,
      descripcionTrabajo: data.descripcionTrabajo || "",
      materiales: data.materiales || [],
      equipos: data.equipos || [],
      extra: data.extra || [],
      manoDeObra: data.manoDeObra || "",
      descripcionManoObra:data.descripcionManoObra,
      monto: data.monto || 0,
      montoIva: data.montoIva || 0,
      totalCost,
      totalIva,
      aprobado: false,
    };

    try {
      const response = await axios.post(
        "https://rosensteininstalaciones.com.ar/api/cotizaciones/",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(response.data);
      console.log(response.data.data._id)
       const nuevaId = response.data.data._id;
    setCotizacionId(nuevaId);
      alert("Éxito", "La cotización ha sido guardada.");
    } catch (error) {
      console.error("Error al guardar la cotización:", error);
      alert("Error", "No se pudo guardar la cotización.");
    }
  };

  const handleSignatureUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 1],
        quality: 1,
      });

      if (!result.cancelled) {
        setSignatureUrl(result.uri);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
    }
  };

  const generarPDF = async () => {
    console.log("ID cotizacion",cotizacionId);
    if (!cotizacionId) {
      alert("Primero guardá la cotización antes de generar el PDF.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `https://rosensteininstalaciones.com.ar/api/cotizaciones/generarpdf/${cotizacionId}`
      );

      const urlPDF = response.data.url; // Asegurate de que el backend devuelve esto
      console.log("Se genero el pdf",response.data.url); 
      if (urlPDF) {
        const supported = await Linking.canOpenURL(urlPDF);
        if (supported) {
          await Linking.openURL(urlPDF);
        } else {
          alert("No se puede abrir el enlace del PDF.");
        }
      } else {
        alert("No se pudo obtener la URL del PDF.");
      }
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error al generar el PDF.");
    } finally {
      setLoading(false);
    }
  };

  const compartirPDF = async () => {
    if (pdfUri) {
      try {
        await Sharing.shareAsync(pdfUri);
      } catch (error) {
        console.error("Error sharing PDF:", error);
      }
    }
  };

  const renderValue = (value) => {
  return value === 'Vacío' || value === 'No especificado'
    ? <Text style={{ color: 'red' }}>{value}</Text>
    : value;
};

const validarResumen = (resumen) => {
  const camposCriticos = [
    'Cliente',
    'CUIT',
    'Correo',
    'Sucursal',
    'NombreTrabajo',
    'ManoDeObra',
    'Total',
    'TotalConIVA',
  ];
  const vacios = camposCriticos.filter((campo) =>
    resumen[campo] === 'No especificado' || resumen[campo] === 'Vacío'
  );
  return {
    esValido: vacios.length === 0,
    camposFaltantes: vacios,
  };
};

const handlePreview = () => {
  const data = getValues(); 
  console.log("---INFO DATA ---",data);
   const totalCost =
    (Number(data.manoDeObra) || 0) +
    (data.materiales?.reduce((acc, item) => acc + (Number(item.monto) || 0), 0) || 0) +
    (data.equipos?.reduce((acc, item) => acc + (Number(item.monto) || 0), 0) || 0) +
    (data.extra?.reduce((acc, item) => acc + (Number(item.monto) || 0), 0) || 0);

  const totalIva = totalCost * 1.21;
   // datos del formulario
  const resumen = {
    Cliente: clienteSeleccionado?.username || data.clienteManual || 'No especificado',
    CUIT: clienteSeleccionado?.cuit || data.cuitManual || 'No especificado',
    RazonSocial: clienteSeleccionado?.razonSocial || data.razonSocialManual || 'No especificado',
    Correo: clienteSeleccionado?.email || data.correoContacto || 'No especificado',
    Sucursal: sucursalSeleccionada || SUCURSAL_MANUAL_ID,
    Máquina: maquinaSeleccionada === "No se especifica" ? null : maquinaSeleccionada,
    NombreTrabajo: data.nombreTrabajo || 'No especificado',
    DescripciónTrabajo: data.descripcionTrabajo || 'No especificado',
    Materiales: data.materiales?.length ? `${data.materiales.length} ítems` : 'Vacío',
    Equipos: data.equipos?.length ? `${data.equipos.length} ítems` : 'Vacío',
    Extras: data.extra?.length ? `${data.extra.length} ítems` : 'Vacío',
    ManoDeObra: data.manoDeObra || 'No especificado',
    descripcionManoObra: data.descripcionManoObra || 'Vacio',
    totalCost:totalCost,
    totalIva:totalIva,
    montoTotal:totalCost
  };
  console.log(resumen)
  setPreviewData(resumen);
  const resultado = validarResumen(resumen);
  setValidacionResumen(resultado);
  setModalVisible(true); 
};

  return (
    <ScrollView style={styles.container}>
      <Portal>
        <Dialog visible={modalVisible} onDismiss={() => setModalVisible(false)}>
          <Dialog.Title>Resumen de Cotización</Dialog.Title>

          {/* Estado de validación */}
          {validacionResumen?.esValido ? (
            <Text style={{ color: 'green', textAlign: 'center', marginVertical: 10 }}>
              ✅ Todos los campos obligatorios están completos.
            </Text>
          ) : (
            <Text style={{ color: 'red', textAlign: 'center', marginVertical: 10 }}>
              ⚠️ Faltan completar: {validacionResumen?.camposFaltantes?.join(', ')}
            </Text>
          )}

          {/* Contenido solo si previewData existe */}
          {previewData ? (
            <Dialog.ScrollArea>
              <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
                {Object.entries(previewData).map(([key, value]) => (
                  <View key={key} style={{ marginBottom: 6 }}>
                    <Text style={{ fontWeight: 'bold' }}>{key}:</Text>
                    <Text style={{ color: value === 'No especificado' || value === 'Vacío' ? 'red' : 'black' }}>
                      {value}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </Dialog.ScrollArea>
          ) : null}

          {/* Acciones del diálogo */}
          <Dialog.Actions>
            <Button onPress={() => setModalVisible(false)}>Cancelar</Button>
            <Button
              disabled={!validacionResumen?.esValido}
              onPress={() => {
                setModalVisible(false);
                guardarCotizacion(getValues());
              }}
            >
              Confirmar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Card style={styles.card}>
        <Text style={styles.title}>Crear Cotización</Text>
        {/* Tipo de Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Cliente:</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity 
              style={styles.radioOption} 
              onPress={() => setTipoCliente("existente")}
            >
              <RadioButton
                value="existente"
                status={tipoCliente === "existente" ? "checked" : "unchecked"}
                onPress={() => setTipoCliente("existente")}
              />
              <Text>Cliente Existente</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.radioOption} 
              onPress={() => setTipoCliente("nuevo")}
            >
              <RadioButton
                value="nuevo"
                status={tipoCliente === "nuevo" ? "checked" : "unchecked"}
                onPress={() => setTipoCliente("nuevo")}
              />
              <Text>Cliente Nuevo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cliente Existente */}
        {tipoCliente === "existente" && (
          <>
          
            <View style={styles.section}>
            <Text style={styles.sectionTitle}>Buscar Cliente:</Text>
            <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                <TextInput
                    label="Buscar Cliente"
                    value={busquedaCliente}
                    onChangeText={handleBuscarCliente}
                    style={styles.input}
                    onFocus={() => busquedaCliente.length > 0 && setMenuVisible(true)}
                />
                }
                style={styles.menu}
            >
                {clientesFiltrados.length > 0 ? (
                clientesFiltrados.map((cliente) => (
                    <Menu.Item
                    key={cliente._id}
                    title={cliente.username}
                    onPress={() => {
                        handleClienteSeleccionado(cliente);
                        setBusquedaCliente(cliente.username);
                        setMenuVisible(false);
                    }}
                    />
                ))
                ) : (
                <Menu.Item title="No se encontraron clientes" disabled />
                )}
            </Menu>
            </View>

            <View style={styles.section}>
              <Controller
                name="cuit"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="CUIT"
                    value={value}
                    onChangeText={onChange}
                    style={styles.input}
                  />
                )}
              />
            </View>

            <View style={styles.section}>
              <Controller
                name="razonSocial"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Razón Social"
                    value={value}
                    onChangeText={onChange}
                    style={styles.input}
                  />
                )}
              />
            </View>
           
              {/* Correo de Contacto */}
            <View style={styles.section}>
            <Controller
                name="correoContacto"
                control={control}
                render={({ field: { onChange, value } }) => (
                <TextInput
                    label="Correo de Contacto"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    style={styles.input}
                />
                )}
            />
            </View>

            {sucursalesCliente.length > 0 && (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sucursal:</Text>
                <Menu
                visible={visibleSucursalMenu}
                onDismiss={() => setVisibleSucursalMenu(false)}
                anchor={
                    <Button 
                    onPress={() => setVisibleSucursalMenu(true)}
                    icon="office-building"
                    >
                    {sucursalesCliente.find(s => s._id === sucursalSeleccionada)?.nombre || "Seleccionar Sucursal"}
                    </Button>
                }
                >
                {sucursalesCliente.map((sucursal) => (
                    <Menu.Item
                    key={sucursal._id}
                    title={sucursal.nombre}
                    onPress={() => {
                        setSucursalSeleccionada(sucursal._id);
                        setSucursalId(sucursal._id);
                        setVisibleSucursalMenu(false);
                    }}
                    />
                ))}
                </Menu>
            </View>
            )}

            {/* Máquina Dropdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Máquina:</Text>
              <Menu
                visible={visibleMaquinaMenu}
                onDismiss={() => setVisibleMaquinaMenu(false)}
                anchor={
                  <Button onPress={() => setVisibleMaquinaMenu(true)}>
                    {maquinaSeleccionada === "No se especifica" ? 
                      "Seleccionar Máquina" : maquinaSeleccionada}
                  </Button>
                }
              >
                <Menu.Item 
                  title="No se especifica" 
                  onPress={() => {
                    setMaquinaSeleccionada("No se especifica");
                    setVisibleMaquinaMenu(false);
                  }} 
                />
                {maquinas.map((maquina) => (
                  <Menu.Item
                    key={maquina.id}
                    title={`${maquina.name} - ${maquina.model}`}
                    onPress={() => {
                      setMaquinaSeleccionada(maquina.id);
                      setVisibleMaquinaMenu(false);
                    }}
                  />
                ))}
              </Menu>
            </View>

            {/* Encargado Dropdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Encargado:</Text>
              <Menu
                visible={visibleEncargadoMenu}
                onDismiss={() => setVisibleEncargadoMenu(false)}
                anchor={
                  <Button onPress={() => setVisibleEncargadoMenu(true)}>
                    {watch('encargadoTrabajo') || "Seleccionar Encargado"}
                  </Button>
                }
              >
                <Menu.Item 
                  title="No se especifica" 
                  onPress={() => {
                    setValue('encargadoTrabajo', '');
                    setVisibleEncargadoMenu(false);
                  }} 
                />
                {clienteSeleccionado?.encargados?.map((encargado, index) => (
                  <Menu.Item
                    key={index}
                    title={`${encargado.nombre} - ${encargado.cargo || "Sin cargo"}`}
                    onPress={() => {
                      setValue('encargadoTrabajo', encargado.nombre);
                      setVisibleEncargadoMenu(false);
                    }}
                  />
                ))}
              </Menu>
            </View>
          </>
        )}

        {/* Cliente Nuevo */}
        {tipoCliente === "nuevo" && (
          <>
            <View style={styles.section}>
              <Controller
                name="clienteManual"
                control={control}
                rules={{ required: "Este campo es obligatorio" }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <TextInput
                    label="Nombre del Cliente"
                    value={value}
                    onChangeText={onChange}
                    error={!!error}
                    style={styles.input}
                  />
                )}
              />
            </View>

            <View style={styles.section}>
              <Controller
                name="cuitManual"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="CUIT"
                    value={value}
                    onChangeText={onChange}
                    style={styles.input}
                  />
                )}
              />
            </View>

            <View style={styles.section}>
              <Controller
                name="razonSocialManual"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Razón Social"
                    value={value}
                    onChangeText={onChange}
                    style={styles.input}
                  />
                )}
              />
            </View>
            <View style={styles.section}>
              <Controller
                name="direccionManual"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Dirección"
                    value={value}
                    onChangeText={onChange}
                    style={styles.input}
                  />
                )}
              />
            </View>

              {/* Correo de Contacto */}
            <View style={styles.section}>
            <Controller
                name="correoContacto"
                control={control}
                render={({ field: { onChange, value } }) => (
                <TextInput
                    label="Correo de Contacto"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    style={styles.input}
                />
                )}
            />
            </View>
          </>
        )}

        <Divider style={styles.divider} />

        {/* Nombre de Trabajo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nombre de Trabajo:</Text>
          <Menu
            visible={visibleTrabajoMenu}
            onDismiss={() => setVisibleTrabajoMenu(false)}
            anchor={
              <Button onPress={() => setVisibleTrabajoMenu(true)}>
                {watch('nombreTrabajo') || "Seleccionar Trabajo"}
              </Button>
            }
          >
            <Menu.Item 
              title="Selecciona un Trabajo" 
              onPress={() => {
                setValue('nombreTrabajo', '');
                setVisibleTrabajoMenu(false);
              }} 
            />
            {[
              "Instalación A/A",
              "Mantenimiento A/A",
              "Reparación A/A",
              "Consultoría",
              "Plomeria",
              "Mecanica",
              "Herreria",
              "Electricidad",
              "Automatizaciones",
              "Autoelevadores"
            ].map((trabajo) => (
              <Menu.Item
                key={trabajo}
                title={trabajo}
                onPress={() => {
                  setValue('nombreTrabajo', trabajo);
                  setVisibleTrabajoMenu(false);
                }}
              />
            ))}
          </Menu>
        </View>

        {/* Descripción de Trabajo */}
        <View style={styles.section}>
          <Controller
            name="descripcionTrabajo"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Descripción de Trabajo"
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={4}
                style={styles.inputMultiline}
              />
            )}
          />
        </View>

        {/* Materiales */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setMaterialesHabilitados(!materialesHabilitados)}
          >
            <Checkbox
              status={materialesHabilitados ? "checked" : "unchecked"}
              onPress={() => setMaterialesHabilitados(!materialesHabilitados)}
            />
            <Text>Habilitar Materiales</Text>
          </TouchableOpacity>

          {materialesHabilitados && materialFields.map((item, index) => (
            <View key={item.id} style={styles.arrayItem}>
              <Controller
                name={`materiales[${index}].descripcion`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Descripción del Material"
                    value={value}
                    onChangeText={onChange}
                    style={styles.arrayInput}
                  />
                )}
              />
              <Controller
                name={`materiales[${index}].monto`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Monto"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    style={styles.arrayInput}
                  />
                )}
              />
              <Button 
                icon="delete" 
                onPress={() => removeMaterial(index)}
                style={styles.deleteButton}
              >
                Eliminar
              </Button>
            </View>
          ))}

          {materialesHabilitados && (
            <Button 
              icon="plus" 
              onPress={() => appendMaterial({ descripcion: "", monto: "" })}
              style={styles.addButton}
            >
              Agregar Material
            </Button>
          )}
        </View>

        {/* Equipos */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setEquiposHabilitados(!equiposHabilitados)}
          >
            <Checkbox
              status={equiposHabilitados ? "checked" : "unchecked"}
              onPress={() => setEquiposHabilitados(!equiposHabilitados)}
            />
            <Text>Habilitar Equipos</Text>
          </TouchableOpacity>

          {equiposHabilitados && equipoFields.map((item, index) => (
            <View key={item.id} style={styles.arrayItem}>
              <Controller
                name={`equipos[${index}].descripcion`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Descripción del Equipo"
                    value={value}
                    onChangeText={onChange}
                    style={styles.arrayInput}
                  />
                )}
              />
              <Controller
                name={`equipos[${index}].monto`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Monto"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    style={styles.arrayInput}
                  />
                )}
              />
              <Button 
                icon="delete" 
                onPress={() => removeEquipo(index)}
                style={styles.deleteButton}
              >
                Eliminar
              </Button>
            </View>
          ))}

          {equiposHabilitados && (
            <Button 
              icon="plus" 
              onPress={() => appendEquipo({ descripcion: "", monto: "" })}
              style={styles.addButton}
            >
              Agregar Equipo
            </Button>
          )}
        </View>

        {/* Mano de Obra */}
        <View style={styles.section}>
          <Controller
            name="manoDeObra"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Mano De Obra"
                value={value}
                onChangeText={onChange}
                style={styles.input}
              />
            )}
          />
        </View>
        {/* Descripcion Mano de Obra */}
        <View style={styles.section}>
          <Controller
            name="descripcionManoObra"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Descripción de Mano de Obra"
                value={value}
                onChangeText={onChange}
                style={styles.input}
              />
            )}
          />
        </View>

        {/* Extra */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setExtraHabilitados(!extraHabilitados)}
          >
            <Checkbox
              status={extraHabilitados ? "checked" : "unchecked"}
              onPress={() => setExtraHabilitados(!extraHabilitados)}
            />
            <Text>Habilitar Extra</Text>
          </TouchableOpacity>

          {extraHabilitados && extraFields.map((item, index) => (
            <View key={item.id} style={styles.arrayItem}>
              <Controller
                name={`extra[${index}].descripcion`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Descripción del Extra"
                    value={value}
                    onChangeText={onChange}
                    style={styles.arrayInput}
                  />
                )}
              />
              <Controller
                name={`extra[${index}].monto`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Monto"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    style={styles.arrayInput}
                  />
                )}
              />
              <Button 
                icon="delete" 
                onPress={() => removeExtra(index)}
                style={styles.deleteButton}
              >
                Eliminar
              </Button>
            </View>
          ))}

          {extraHabilitados && (
            <Button 
              icon="plus" 
              onPress={() => appendExtra({ descripcion: "", monto: "" })}
              style={styles.addButton}
            >
              Agregar Extra
            </Button>
          )}
        </View>

        {/* Montos */}
        <View style={styles.section}>
          <Controller
            name="monto"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Monto"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                style={styles.input}
              />
            )}
          />
        </View>

        <View style={styles.section}>
          <Controller
            name="montoIva"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Monto + IVA"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                style={styles.input}
              />
            )}
          />
        </View>

        <View style={styles.section}>
          <Controller
            name="montoTotal"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Monto Total"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                style={styles.input}
              />
            )}
          />
        </View>

        {/* Fechas */}
        <View style={styles.section}>
          <Controller
            name="fechaTrabajo"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Fecha de Trabajo"
                value={value}
                onChangeText={onChange}
                style={styles.input}
              />
            )}
          />
        </View>

        <View style={styles.section}>
          <Controller
            name="numeroFactura"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Número de Factura"
                value={value}
                onChangeText={onChange}
                style={styles.input}
              />
            )}
          />
        </View>

        <View style={styles.section}>
          <Controller
            name="fechaFacturacion"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Fecha de Facturación"
                value={value}
                onChangeText={onChange}
                style={styles.input}
              />
            )}
          />
        </View>

        {/* Estado */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado:</Text>
          <Menu
            visible={visibleEstadoMenu}
            onDismiss={() => setVisibleEstadoMenu(false)}
            anchor={
              <Button onPress={() => setVisibleEstadoMenu(true)}>
                {watch('estado') || "Seleccionar Estado"}
              </Button>
            }
          >
            {["pendiente", "aprobado", "rechazado"].map((estado) => (
              <Menu.Item
                key={estado}
                title={estado.charAt(0).toUpperCase() + estado.slice(1)}
                onPress={() => {
                  setValue('estado', estado);
                  setVisibleEstadoMenu(false);
                }}
              />
            ))}
          </Menu>
        </View>

        {/* Firma */}
        {signatureUrl && (
          <View style={styles.signatureContainer}>
            <Text>Firma:</Text>
            <Image source={{ uri: signatureUrl }} style={styles.signatureImage} />
          </View>
        )}

        {/* Botones de acción */}
        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            loading={loading}
            style={styles.actionButton}
            onPress={() => setModalVisible(true)}>
            Mostrar resumen
          </Button>
          <Button 
            mode="contained" 
            onPress={handlePreview}
            loading={loading}
            style={styles.actionButton}
          >
            Guardar Cotización
          </Button>
        
         <Button 
          mode="contained" 
          onPress={generarPDF}
          loading={loading}
          style={styles.actionButton}
        >
          Generar PDF
        </Button>
        {/**
          <Button 
            mode="contained" 
            onPress={handleSignatureUpload}
            style={styles.actionButton}
          >
            Agregar Firma
          </Button>
         */}

          {pdfUri && (
            <Button 
              mode="contained" 
              onPress={compartirPDF}
              style={styles.actionButton}
            >
              Compartir PDF
            </Button>
          )}
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'white',
  },
  inputMultiline: {
    marginBottom: 8,
    backgroundColor: 'white',
    minHeight: 100,
  },
  divider: {
    marginVertical: 16,
    height: 1,
    backgroundColor: '#1A73E8',
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  arrayItem: {
    marginBottom: 8,
  },
  arrayInput: {
    marginBottom: 4,
    backgroundColor: 'white',
  },
  addButton: {
    marginTop: 8,
  },
  deleteButton: {
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 16,
  },
  actionButton: {
    marginBottom: 8,
  },
  signatureContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  signatureImage: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  sucursalButton: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    justifyContent: 'flex-start',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
modalContainer: {
  backgroundColor: "white",
  padding: 20,
  margin: 20,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "red",
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 10,
},
modalItem: {
  marginBottom: 8,
},
sectionTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  marginTop: 16,
  marginBottom: 8,
},
item: {
  marginBottom: 6,
  fontSize: 14,
},


});

export default CotizationForm;