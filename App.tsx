import React, { useEffect } from "react";
import { NativeRouter, Routes, Route, useNavigate, useLocation } from "react-router-native";
import { BackHandler, Alert } from "react-native";


// Importando telas
import TelaRecSenha from "./app/TelaRecSenha";
import TelaCadastro from "./app/TelaCadastro";
import TelaLogin from "./app/TelaLogin";
import TelaMonitoramento from "./app/TelaMonitoramento";
import TelaControle from "./app/TelaControle";
import TelaGraficos from "./app/TelaGraficos";
import TelaUsuario from "./app/TelaUsuario";

export default function App() {
  return (
    <NativeRouter>
      <BackHandlerComponent />
      <Routes>
        <Route path="/" element={<TelaLogin />} />
        <Route path="/login" element={<TelaLogin />} />
        <Route path="/register" element={<TelaCadastro />} />
        <Route path="/forgot-password" element={<TelaRecSenha />} />
        <Route path="/monitoramento" element={<TelaMonitoramento />} />
        <Route path="/controle" element={<TelaControle />} />
        <Route path="/graficos" element={<TelaGraficos />} />
        <Route path="/usuario" element={<TelaUsuario />} />
      </Routes>
    </NativeRouter>
  );
}

// Componente que adiciona funcionalidade de voltar
function BackHandlerComponent() {
  const navigate = useNavigate();
  const location = useLocation(); // Obtém a rota atual corretamente no React Native

  useEffect(() => {
    const handleBackPress = () => {
      const homeRoutes = ["/login", "/register", "/forgot-password"]; // Pode voltar nessas telas
      const mainRoutes = ["/monitoramento", "/controle", "/graficos", "/usuario"]; // Evita sair direto

      if (homeRoutes.includes(location.pathname)) {
        navigate(-1); // Permite voltar entre Login, Cadastro e Recuperação de Senha
        return true;
      }

      if (mainRoutes.includes(location.pathname)) {
        Alert.alert(
          "Sair do app",
          "Deseja realmente sair?",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Sair", onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: true }
        );
        return true; // Bloqueia a saída até que o usuário confirme
      }

      return false; // Se não estiver em nenhuma dessas telas, deixa o comportamento normal
    };

    BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
    };
  }, [navigate, location]);

  return null;
}
