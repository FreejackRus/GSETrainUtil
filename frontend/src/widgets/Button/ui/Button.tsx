import { getEquipmentData } from "../api/getEquipmentData";

export const Button = () => {
  const handleClick = async () => {
    const value = await getEquipmentData();
    console.log(value);
    
  };

  return <button onClick={handleClick}>Жми</button>;
};
