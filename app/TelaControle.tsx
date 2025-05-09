import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { getDatabase, ref, onValue, push, set, off } from 'firebase/database';
import { useNavigate, useLocation } from 'react-router-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const db = getDatabase();

export default function TelaControle() {
  const navigate = useNavigate();
  const location = useLocation();

  const [bombaLigada, setBombaLigada] = useState<boolean>(false);
  const [rpm1, setRpm1] = useState<string>('');
  const [rpm2, setRpm2] = useState<string>('');
  const [temperatura, setTemperatura] = useState<string>('');
  const [ph, setPh] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const statusRef = ref(db, 'bombaAguaStatus');
    const configuracoesRef = ref(db, 'configuracoesAtuais');

    const statusListener = onValue(statusRef, (snapshot) => {
      setBombaLigada(snapshot.val()?.ligada || false);
    });

    const configuracoesListener = onValue(configuracoesRef, (snapshot) => {
      if (snapshot.exists()) {
        const config = snapshot.val();
        setRpm1(String(config.rpm1 ?? ''));
        setRpm2(String(config.rpm2 ?? ''));
        setTemperatura(String(config.temperatura ?? ''));
        setPh(String(config.ph ?? ''));
      }
    });

    return () => {
      off(statusRef, statusListener);
      off(configuracoesRef, configuracoesListener);
    };
  }, []);

  const salvarConfiguracoes = async () => {
    setLoading(true);
    try {
      const timestamp = new Date().toISOString();

      const novosDados = {
        ligada: bombaLigada,
        rpm1: rpm1 !== '' ? Number(rpm1) : 0,
        rpm2: rpm2 !== '' ? Number(rpm2) : 0,
        temperatura: temperatura !== '' ? Number(temperatura) : 0,
        ph: ph !== '' ? Number(ph) : 0,
        timestamp,
      };

      await set(ref(db, 'configuracoesAtuais'), novosDados);

      await push(ref(db, 'rpmBomba1Readings'), { timestamp, value: novosDados.rpm1 });
      await push(ref(db, 'rpmBomba2Readings'), { timestamp, value: novosDados.rpm2 });
      await push(ref(db, 'temperatureReadings'), { timestamp, value: novosDados.temperatura });
      await push(ref(db, 'phReadings'), { timestamp, value: novosDados.ph });

      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações.');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#fff' }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <Text style={styles.titulo}>Controle</Text>
            <View style={styles.underline} />

            <Text style={styles.title}>Controle da Bomba</Text>
            <View style={styles.card}>
              <Text style={styles.label}>Bomba d'água:</Text>
              <Switch
                value={bombaLigada}
                onValueChange={setBombaLigada}
                trackColor={{ false: "#ccc", true: "green" }}
                thumbColor={bombaLigada ? "white" : "gray"}
              />
            </View>

            <Text style={styles.title}>Configuração de Parâmetros</Text>
            {[{ label: 'RPM Bomba 1', value: rpm1, setValue: setRpm1 },
              { label: 'RPM Bomba 2', value: rpm2, setValue: setRpm2 },
              { label: 'Temperatura (°C)', value: temperatura, setValue: setTemperatura },
              { label: 'pH Desejado', value: ph, setValue: setPh }].map((item, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.label}>{item.label}:</Text>
                <TextInput
                  style={styles.input}
                  value={item.value}
                  keyboardType="numeric"
                  onChangeText={item.setValue}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.saveButton} onPress={salvarConfiguracoes} disabled={loading}>
              <Text style={styles.saveButtonText}>{loading ? 'Salvando...' : 'Salvar Configurações'}</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.navBar}>
            {[
              { route: '/monitoramento', icon: 'home' },
              { route: '/controle', icon: 'settings' },
              { route: '/graficos', icon: 'analytics' },
              { route: '/usuario', icon: 'person' }
            ].map((tab, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.navButton, location.pathname === tab.route && styles.activeButton]}
                onPress={() => navigate(tab.route)}
              >
                <Ionicons name={tab.icon} size={24} color={location.pathname === tab.route ? 'yellow' : 'white'} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2E7D32',
    paddingVertical: 15,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopEndRadius: 8,
    borderTopStartRadius: 8,
  },
  navButton: {
    padding: 10,
  },
  activeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'left',
  },
  underline: {
    height: 3,
    width: '25%',
    backgroundColor: 'green',
    marginVertical: 8,
  },
});
