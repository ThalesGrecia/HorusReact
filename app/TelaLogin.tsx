import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { 
  Image, StyleSheet, Text, TextInput, View, TouchableOpacity, 
  ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, 
  Alert, BackHandler, SafeAreaView, Dimensions
} from 'react-native';
import Checkbox from 'expo-checkbox';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { useNavigate } from 'react-router-native';

export default function TelaLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [exibir, setExibir] = useState(false);
  const [manterConectado, setManterConectado] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const backAction = () => {
      navigate(-1);
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      navigate('/monitoramento'); 
    } catch (error) {
      let mensagemErro = 'Ocorreu um erro ao fazer login.';

      if (error instanceof Error && 'code' in error) {
        const firebaseError = error as { code: string };

        if (firebaseError.code === 'auth/user-not-found') {
          mensagemErro = 'Usuário não encontrado.';
        } else if (firebaseError.code === 'auth/wrong-password') {
          mensagemErro = 'Senha incorreta.';
        } else if (firebaseError.code === 'auth/invalid-email') {
          mensagemErro = 'E-mail inválido.';
        }
      }

      Alert.alert('Erro', mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  const { width, height } = Dimensions.get("window");

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.container} 
          keyboardShouldPersistTaps="handled"
        >
          <Image 
            source={require('../assets/LogoVersao1Branca.png')} 
            style={[styles.logo, { width: width * 0.5, height: height * 0.2 }]} 
            resizeMode="contain"
          />

          <View style={styles.card}>
            <Text style={styles.title}>Faça seu Login</Text>
            <View style={styles.separator} />

            <Text style={styles.label}>Seu email*</Text>
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

            <View style={styles.checkboxContainer}>
              <Checkbox 
                value={manterConectado} 
                onValueChange={setManterConectado} 
                color={manterConectado ? 'green' : undefined} 
              />
              <Text style={styles.checkboxText}>Mantenha-me conectado</Text>
            </View>

            <TouchableOpacity onPress={() => navigate('/register')}>
              <Text style={styles.link}>Não possui conta? Crie uma agora mesmo!</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, { opacity: loading ? 0.6 : 1 }]} 
              onPress={handleLogin} 
              disabled={loading}
            >
              {loading ? <ActivityIndicator size={24} color="#FFF" /> : <Text style={styles.buttonText}>ENTRAR</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigate('/forgot-password')}>
              <Text style={styles.forgotPassword}>Esqueceu sua senha? Clique aqui</Text>
            </TouchableOpacity>
          </View>
          <StatusBar style="auto" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#68AB7B',
  },
  keyboard: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 30,
  },
  logo: {
    marginVertical: 20,
  },
  card: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 16,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  separator: {
    height: 4,
    width: '73%',
    backgroundColor: 'green',
    marginVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
  },
  input: {
    backgroundColor: '#d3d3d3',
    borderWidth: 1,
    borderColor: '#c1c1c1',
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '100%',
    height: 57,
    fontSize: 16,
    marginVertical: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#d3d3d3',
    borderRadius: 10,
  },
  inputSenha: {
    flex: 1,
    paddingHorizontal: 15,
    height: 57,
    fontSize: 16,
  },
  iconContainer: {
    padding: 10,
  },
  icon: {
    width: 24,
    height: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginTop: '10%'
  },
  checkboxText: {
    marginLeft: 5,
  },
  link: {
    color: 'blue',
    textAlign: 'center',
    marginTop: '10%',
  },
  button: {
    backgroundColor: 'green',
    width: '100%',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: '10%',
    
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: 'blue',
    textAlign: 'center',
    marginTop: '10%',
  },
});
