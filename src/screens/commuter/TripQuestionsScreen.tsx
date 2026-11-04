import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommuterStackParamList } from '../../navigation/CommuterNavigator';
import { tripService } from '../../services/api/trips';
import { apiError } from '../../services/api/axios';
import { QueueReport, RideRating, TripFeedback } from '../../types/trips';
import { Banner, Button, Field, Screen, Segmented } from '../../components/ui';
import { formatFare } from './tripFormat';
import { colors } from '../../theme';

type FareAnswer = 'same' | 'more' | 'less' | '';

/** H8: three optional questions after a trip. Fare answers prompt the rank to confirm its fare. */
const TripQuestionsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CommuterStackParamList>>();
  const { trip } = useRoute<RouteProp<CommuterStackParamList, 'TripQuestions'>>().params;
  const [fare, setFare] = useState<FareAnswer>('');
  const [amount, setAmount] = useState('');
  const [queue, setQueue] = useState<QueueReport | ''>('');
  const [rating, setRating] = useState<RideRating | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const done = () => navigation.reset({ index: 0, routes: [{ name: 'Tabs', params: { screen: 'Trips' } }] });

  const send = async () => {
    const answers: TripFeedback = {};
    if (fare === 'same') answers.farePaid = Number(trip.fare);
    if (fare === 'more' || fare === 'less') {
      const paid = Number(amount.replace(/[^0-9.]/g, ''));
      if (!paid || paid <= 0) {
        setError('Enter what you paid, or skip the fare question');
        return;
      }
      answers.farePaid = paid;
    }
    if (queue) answers.queue = queue;
    if (rating) answers.rating = rating;
    if (!Object.keys(answers).length) {
      done();
      return;
    }
    setSending(true);
    setError(null);
    try {
      await tripService.feedback(trip.id, answers);
      done();
    } catch (e) {
      setError(apiError(e, 'Could not send your answers'));
      setSending(false);
    }
  };

  return (
    <Screen
      subtitle={`Trip saved · ${trip.rank.name} → ${trip.destination}`}
      title="3 quick questions"
      footer={
        <>
          <Button testID="send-answers" title="Send answers" onPress={send} loading={sending} />
          <Button title="Skip" variant="link" onPress={done} />
        </>
      }
    >
      <Text style={styles.intro}>Your answers keep fares and times right for everyone. All optional.</Text>
      {error ? <Banner tone="danger">{error}</Banner> : null}

      <View style={styles.question} accessibilityRole="radiogroup">
        <Text style={styles.ask}>Was the fare {formatFare(Number(trip.fare))}?</Text>
        <Segmented<FareAnswer>
          options={[
            { value: 'same', label: `Yes, ${formatFare(Number(trip.fare))}` },
            { value: 'more', label: 'I paid more' },
            { value: 'less', label: 'I paid less' },
          ]}
          value={fare}
          onChange={v => setFare(v === fare ? '' : v)}
        />
        {fare === 'more' || fare === 'less' ? (
          <Field
            label="What did you pay?"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="e.g. 20"
            hint="If several riders report a new fare, we ask the rank to update it."
          />
        ) : null}
      </View>

      <View style={styles.question} accessibilityRole="radiogroup">
        <Text style={styles.ask}>When you got to the rank…</Text>
        <Segmented<QueueReport | ''>
          options={[
            { value: 'TAXI_LOADING', label: 'A taxi was loading' },
            { value: 'WAITED', label: 'I waited for a taxi' },
            { value: 'LONG_QUEUE', label: 'Long queue of people' },
          ]}
          value={queue}
          onChange={v => setQueue(v === queue ? '' : v)}
        />
      </View>

      <View style={styles.question} accessibilityRole="radiogroup">
        <Text style={styles.ask}>How was the ride?</Text>
        <Segmented<RideRating | ''>
          options={[
            { value: 'GOOD', label: 'Good' },
            { value: 'OK', label: 'OK' },
            { value: 'BAD', label: 'Bad' },
          ]}
          value={rating}
          onChange={v => setRating(v === rating ? '' : v)}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 20, color: colors.textSubtle },
  question: { gap: 10, marginTop: 6 },
  ask: { fontSize: 16, fontWeight: '700', color: colors.text },
});

export default TripQuestionsScreen;
