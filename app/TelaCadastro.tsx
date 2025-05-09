import '@expo/metro-runtime';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { 
  Image, 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  ScrollView, 
  Platform, 
  Dimensions, 
  SafeAreaView 
} from 'react-native';
import { auth } from './firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from "react-router-native";

const { width } = Dimensions.get('window');

export default function TelaCadastro() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [exibir, setExibir] = useState(false);
  const [exibirConfirmar, setExibirConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erroSenha, setErroSenha] = useState('');
  const [erroCadastro, setErroCadastro] = useState('');
  const navigate = useNavigate();
  const { width, height } = Dimensions.get('window');


  function validarSenha(text: string) {
    setConfirmarSenha(text);
    setErroSenha(text !== senha ? 'As senhas não coincidem.' : '');
  }

  const handleCadastro = async () => {
    if (senha !== confirmarSenha) return;
    setLoading(true);
    setErroCadastro('');
    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      alert('Cadastro realizado com sucesso!');
      navigate('/login');
    } catch (error) {
      setErroCadastro(error instanceof Error ? error.message : 'Erro desconhecido ao cadastrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#68AB7B' }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image 
                   source={require('../assets/LogoVersao1Branca.png')} 
                   style={[styles.logo, { width: width * 0.5, height: height * 0.2 }]} 
                   resizeMode="contain"
                 />
       
          
          <View style={styles.card}>
            <Text style={styles.title}>Faça o seu cadastro</Text>
            <View style={styles.separator} />

            <Text style={styles.label}>Seu e-mail*</Text>
            <TextInput 
              placeholder="Digite seu e-mail" 
              placeholderTextColor="#8c8c8c" 
              onChangeText={setEmail} 
              value={email} 
              style={styles.input} 
              keyboardType="email-address" 
              autoCapitalize="none" 
            />

            <Text style={styles.label}>Sua senha*</Text>
            <View style={styles.inputContainer}>
              <TextInput 
                placeholder="Digite sua senha" 
                placeholderTextColor="#8c8c8c" 
                onChangeText={setSenha} 
                value={senha} 
                style={styles.inputSenha} 
                secureTextEntry={!exibir} 
              />
              <TouchableOpacity onPress={() => setExibir(!exibir)} style={styles.iconContainer}>
                <Image 
                  source={exibir ? require('../assets/olhoAberto.png') : require('../assets/olhoFechado.png')} 
                  style={styles.icon} 
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirme sua senha*</Text>
            <View style={styles.inputContainer}>
              <TextInput 
                placeholder="Digite sua senha novamente" 
                placeholderTextColor="#8c8c8c" 
                onChangeText={validarSenha} 
                value={confirmarSenha} 
                style={styles.inputSenha} 
                secureTextEntry={!exibirConfirmar} 
              />
              <TouchableOpacity onPress={() => setExibirConfirmar(!exibirConfirmar)} style={styles.iconContainer}>
                <Image 
                  source={exibirConfirmar ? require('../assets/olhoAberto.png') : require('../assets/olhoFechado.png')} 
                  style={styles.icon} 
                />
              </TouchableOpacity>
            </View>

            {erroSenha ? <Text style={styles.erroTexto}>{erroSenha}</Text> : null}
            {erroCadastro ? <Text style={styles.erroTexto}>{erroCadastro}</Text> : null}

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: senha === confirmarSenha && senha ? 'green' : 'gray' }]} 
              onPress={handleCadastro} 
              disabled={senha !== confirmarSenha || senha === '' || loading}
            >
              {loading ? <ActivityIndicator size={24} color="#FFF" /> : <Text style={styles.buttonText}>CADASTRAR</Text>}
            </TouchableOpacity>
          </View>

          <StatusBar style="auto" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 30,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 20,
  },
  card: {
    width: width * 0.9,
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 16,
    elevation: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  separator: {
    height: 4,
    width: '93%',
    backgroundColor: 'green',
    marginVertical: 10,
    borderRadius: 10,
  },
  label: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d3d3d3',
    borderWidth: 1,
    borderColor: '#c1c1c1',
    borderRadius: 16,
    width: '100%',
    height: 55,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  inputSenha: {
    flex: 1,
    fontSize: 16,
    color: '#363636',
  },
  iconContainer: {
    padding: 10,
  },
  icon: {
    width: 24,
    height: 24,
  },
  erroTexto: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    width: '70%',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: '10%',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#d3d3d3',
    borderRadius: 16,
    width: '100%',
    height: 57,
    fontSize: 16,
    paddingHorizontal: 15,
    marginTop: 10,
    color: '#363636',
  },
});
