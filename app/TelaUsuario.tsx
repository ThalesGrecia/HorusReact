import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigate, useLocation } from 'react-router-native';
import { auth, db } from './firebaseConfig';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { ref, get } from 'firebase/database';

export default function TelaUsuario() {
  const navigate = useNavigate();
  const location = useLocation();

  const [nome, setNome] = useState('Carregando...');
  const [novaSenha, setNovaSenha] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [mostrarCamposSenha, setMostrarCamposSenha] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const userRef = ref(db, `usuarios/${user.uid}`);
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const dados = snapshot.val();
            setNome(dados.nome || 'Usuário');
          } else {
            setNome('Usuário');
          }
        })
        .catch((error) => {
          console.error('Erro ao buscar nome do usuário:', error);
          setNome('Erro ao carregar');
        });
    }
  }, []);

  const handleAlterarSenha = async () => {
    if (!novaSenha || novaSenha.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (!senhaAtual) {
      Alert.alert('Erro', 'Informe a senha atual para confirmar.');
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email!, senhaAtual);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, novaSenha);
      Alert.alert('Sucesso', 'Senha atualizada com sucesso!');
      setNovaSenha('');
      setSenhaAtual('');
      setMostrarCamposSenha(false);
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error.code, error.message);
      let mensagem = 'Erro ao alterar a senha.';

      if (error.code === 'auth/invalid-credential') {
        mensagem = 'Senha atual incorreta.';
      } else if (error.code === 'auth/weak-password') {
        mensagem = 'A nova senha é muito fraca.';
      } else if (error.code === 'auth/requires-recent-login') {
        mensagem = 'Por segurança, faça login novamente para alterar a senha.';
      }

      Alert.alert('Erro', mensagem);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      Alert.alert('Logout', 'Você saiu da sua conta.');
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Erro ao sair da conta.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <Ionicons name="person-circle-outline" size={100} color="green" />
        <Text style={styles.nome}>{nome}</Text>

        <TouchableOpacity style={styles.cardapioBotao} onPress={() => setMostrarCamposSenha(!mostrarCamposSenha)}>
          <Text style={styles.cardapioTexto}>Alterar Senha</Text>
        </TouchableOpacity>

        {mostrarCamposSenha && (
          <>
            <Text style={styles.label}>Nova Senha</Text>
            <TextInput
              style={styles.input}
              value={novaSenha}
              onChangeText={setNovaSenha}
              placeholder="Nova senha"
              secureTextEntry
            />

            <Text style={styles.label}>Senha Atual</Text>
            <TextInput
              style={styles.input}
              value={senhaAtual}
              onChangeText={setSenhaAtual}
              placeholder="Senha atual"
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleAlterarSenha}>
              <Text style={styles.buttonText}>Salvar Nova Senha</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navButton, location.pathname === '/monitoramento' && styles.activeButton]}
          onPress={() => navigate('/monitoramento')}
        >
          <Ionicons name="home" size={24} color={location.pathname === '/monitoramento' ? 'yellow' : 'white'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, location.pathname === '/controle' && styles.activeButton]}
          onPress={() => navigate('/controle')}
        >
          <Ionicons name="settings" size={24} color={location.pathname === '/controle' ? 'yellow' : 'white'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, location.pathname === '/graficos' && styles.activeButton]}
          onPress={() => navigate('/graficos')}
        >
          <Ionicons name="analytics" size={24} color={location.pathname === '/graficos' ? 'yellow' : 'white'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, location.pathname === '/usuario' && styles.activeButton]}
          onPress={() => navigate('/usuario')}
        >
          <Ionicons name="person" size={24} color={location.pathname === '/usuario' ? 'yellow' : 'white'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  nome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'green',
    marginVertical: 20,
    textAlign: 'center',
  },
  cardapioBotao: {
    backgroundColor: '#e0f2f1',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  cardapioTexto: {
    fontSize: 16,
    color: 'green',
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    color: '#555',
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  logoutButton: {
    backgroundColor: '#c62828',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'green',
    paddingVertical: 15,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopEndRadius: 8,
    borderTopStartRadius: 8,
  },
  navButton: {
    padding: 10,
    borderRadius: 10,
  },
  activeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
  },
});
