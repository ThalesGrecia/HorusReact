import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { 
  Image, StyleSheet, Text, TextInput, View, TouchableOpacity, 
  ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, 
  Alert, BackHandler, SafeAreaView, Dimensions 
} from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { useNavigate } from 'react-router-native';

export default function TelaRecuperacao() {
  const [email, setEmail] = useState('');
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

  const enviarCodigoRecuperacao = async () => {
    if (!email) {
      Alert.alert('Erro', 'Digite um e-mail válido!');
      return;
    }
  
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Sucesso', 'E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      navigate('/login');
    } catch (error) {
      let mensagemErro = 'Ocorreu um erro ao enviar o e-mail.';
      if (error instanceof Error && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/user-not-found') {
          mensagemErro = 'E-mail não encontrado.';
        } else if (firebaseError.code === 'auth/invalid-email') {
          mensagemErro = 'Formato de e-mail inválido.';
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
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Image 
            source={require('../assets/LogoVersao1Branca.png')} 
            style={[styles.logo, { width: width * 0.5, height: height * 0.2 }]} 
            resizeMode="contain"
          />
          
          <View style={styles.card}>
            <Text style={styles.title}>Recuperação de senha</Text>
            <View style={styles.separator} />

            <Text style={styles.label}>Digite o e-mail cadastrado*</Text>
            <TextInput
              placeholder="Digite seu e-mail"
              placeholderTextColor="#8c8c8c"
              onChangeText={setEmail}
              value={email}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity 
              style={[styles.button, { opacity: loading ? 0.6 : 1 }]} 
              onPress={enviarCodigoRecuperacao} 
              disabled={loading}
            >
              {loading ? <ActivityIndicator size={24} color="#FFF" /> : <Text style={styles.buttonText}>ENVIAR CÓDIGO</Text>}
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
});

