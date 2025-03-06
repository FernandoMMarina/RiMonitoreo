export const fetchMachineBySerial = async (serialNumber) => {
    try {
      const response = await fetch(`https://rosensteininstalaciones.com.ar/api/machines/serial/${serialNumber}`);
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.message || "No se encontró la máquina.");
      }
  
      return result.machineId;
    } catch (error) {
      console.error("Error al obtener el ID de la máquina:", error);
      throw error;
    }
  };
  