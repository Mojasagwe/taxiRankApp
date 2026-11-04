import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommuterStackParamList } from '../../navigation/CommuterNavigator';
import { useAuth } from '../../context/AuthContext';
import { rankService } from '../../services/api/ranks';
import { applicationService } from '../../services/api/applications';
import { apiError } from '../../services/api/axios';
import { Rank } from '../../types/admin';
import { ApplicationRequest } from '../../types/applications';
import { Banner, Button, Chip, Field, Loading, Screen, Segmented } from '../../components/ui';
import { colors } from '../../theme';

type Mode = 'existing' | 'new';
const HOURS = /^([01]?\d|2[0-3]):[0-5]\d-([01]?\d|2[0-3]):[0-5]\d$/;

/**
 * Apply to manage a rank: pick an existing rank without an account, or propose one
 * that isn't in Travy yet. With applicationId it edits and resubmits that application.
 */
const ApplyScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CommuterStackParamList>>();
  const { params } = useRoute<RouteProp<CommuterStackParamList, 'Apply'>>();
  const applicationId = params?.applicationId;
  const { signUpIntent, clearSignUpIntent } = useAuth();
  const fromSignUp = signUpIntent === 'RANK_ADMIN';

  const [ranks, setRanks] = useState<Rank[] | null>(null);
  const [mode, setMode] = useState<Mode>('existing');
  const [search, setSearch] = useState('');
  const [rankId, setRankId] = useState<number | null>(null);
  const [proposal, setProposal] = useState({
    name: '', address: '', city: '', province: '', latitude: '', longitude: '', operatingHours: '', capacity: '', contactPhone: '',
  });
  const [designation, setDesignation] = useState('');
  const [motivation, setMotivation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const [allRanks, existing] = await Promise.all([
        rankService.list().catch(() => [] as Rank[]),
        applicationId ? applicationService.get(applicationId).catch(() => null) : Promise.resolve(null),
      ]);
      setRanks(allRanks);
      if (existing) {
        setDesignation(existing.designation);
        setMotivation(existing.motivation ?? '');
        if (existing.rank) {
          setMode('existing');
          setRankId(existing.rank.id);
        } else if (existing.proposedRank) {
          const p = existing.proposedRank;
          setMode('new');
          setProposal({
            name: p.name, address: p.address, city: p.city, province: p.province,
            latitude: p.latitude?.toString() ?? '', longitude: p.longitude?.toString() ?? '',
            operatingHours: p.operatingHours ?? '', capacity: p.capacity?.toString() ?? '', contactPhone: p.contactPhone ?? '',
          });
        }
      }
    })();
  }, [applicationId]);

  const visibleRanks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (ranks ?? []).filter(r => !q || `${r.name} ${r.city} ${r.code}`.toLowerCase().includes(q));
  }, [ranks, search]);

  const setP = (key: keyof typeof proposal) => (value: string) => setProposal(p => ({ ...p, [key]: value }));

  const buildRequest = (): ApplicationRequest | string => {
    if (!designation.trim()) {return 'Tell us your role at the rank';}
    if (mode === 'existing') {
      if (!rankId) {return 'Choose your rank, or switch to "My rank isn\'t listed"';}
      return { rankId, designation: designation.trim(), motivation: motivation.trim() || undefined };
    }
    if (proposal.name.trim().length < 3 || !proposal.address.trim() || !proposal.city.trim() || !proposal.province.trim()) {
      return 'Rank name, address, city and province are required';
    }
    if (proposal.operatingHours && !HOURS.test(proposal.operatingHours.trim())) {return 'Operating hours look like 04:30-21:00';}
    const num = (v: string) => (v.trim() ? Number(v) : undefined);
    if ([proposal.latitude, proposal.longitude, proposal.capacity].some(v => v.trim() && Number.isNaN(Number(v)))) {
      return 'Location and capacity must be numbers';
    }
    return {
      proposedRank: {
        name: proposal.name.trim(),
        address: proposal.address.trim(),
        city: proposal.city.trim(),
        province: proposal.province.trim(),
        latitude: num(proposal.latitude),
        longitude: num(proposal.longitude),
        operatingHours: proposal.operatingHours.trim() || undefined,
        capacity: num(proposal.capacity),
        contactPhone: proposal.contactPhone.trim() || undefined,
      },
      designation: designation.trim(),
      motivation: motivation.trim() || undefined,
    };
  };

  const handleSubmit = async () => {
    const request = buildRequest();
    if (typeof request === 'string') {
      setError(request);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (applicationId) {
        await applicationService.resubmit(applicationId, request);
      } else {
        await applicationService.submit(request);
      }
      clearSignUpIntent();
      navigation.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'MyApplication' }] });
    } catch (e) {
      setError(apiError(e, 'Could not submit your application'));
      setSubmitting(false);
    }
  };

  const skip = () => {
    clearSignUpIntent();
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  if (!ranks) {
    return <Loading />;
  }

  return (
    <Screen
      subtitle={fromSignUp ? 'Step 2 of 2' : undefined}
      title={applicationId ? 'Update application' : 'Apply to manage a rank'}
      onBack={fromSignUp ? undefined : () => navigation.goBack()}
      footer={
        <>
          <Button testID="submit-application" title={applicationId ? 'Resubmit application' : 'Submit application'} onPress={handleSubmit} loading={submitting} />
          {fromSignUp ? <Button title="Skip for now" variant="link" onPress={skip} /> : null}
        </>
      }
    >
      {error ? <Banner tone="danger">{error}</Banner> : null}
      <Segmented<Mode>
        value={mode}
        onChange={setMode}
        options={[
          { value: 'existing', label: 'Existing rank' },
          { value: 'new', label: "My rank isn't listed" },
        ]}
      />

      {mode === 'existing' ? (
        <View style={styles.list}>
          <Field label="Find your rank" value={search} onChangeText={setSearch} placeholder="Search by name or city" />
          {visibleRanks.map(rank => {
            const taken = !!rank.hasAccount;
            const selected = rank.id === rankId;
            return (
              <TouchableOpacity
                key={rank.id}
                testID={`rank-${rank.code}`}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled: taken }}
                disabled={taken}
                onPress={() => setRankId(rank.id)}
                style={[styles.rank, selected && styles.rankOn, taken && styles.rankTaken]}
              >
                <View style={styles.rankText}>
                  <Text style={styles.rankName}>{rank.name}</Text>
                  <Text style={styles.rankMeta}>{[rank.city, rank.province].filter(Boolean).join(' · ')}</Text>
                </View>
                <Chip label={taken ? 'Has admin' : selected ? 'Selected' : 'Available'} tone={taken ? 'neutral' : selected ? 'dark' : 'success'} />
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <>
          <Banner>Tell us about the rank. A System Administrator checks the details and adds it to Travy when your application is approved.</Banner>
          <Field testID="proposed-name" label="Rank name" value={proposal.name} onChangeText={setP('name')} />
          <Field testID="proposed-address" label="Street address" value={proposal.address} onChangeText={setP('address')} />
          <Field testID="proposed-city" label="City" value={proposal.city} onChangeText={setP('city')} />
          <Field testID="proposed-province" label="Province" value={proposal.province} onChangeText={setP('province')} />
          <Field label="Latitude (optional)" value={proposal.latitude} onChangeText={setP('latitude')} keyboardType="numbers-and-punctuation" hint="Map pin picker coming soon" />
          <Field label="Longitude (optional)" value={proposal.longitude} onChangeText={setP('longitude')} keyboardType="numbers-and-punctuation" />
          <Field label="Operating hours (optional)" value={proposal.operatingHours} onChangeText={setP('operatingHours')} placeholder="04:30-21:00" />
          <Field label="Taxi capacity (optional)" value={proposal.capacity} onChangeText={setP('capacity')} keyboardType="number-pad" />
          <Field label="Rank contact number (optional)" value={proposal.contactPhone} onChangeText={setP('contactPhone')} keyboardType="phone-pad" />
        </>
      )}

      <Field testID="designation-input" label="Your role at the rank" value={designation} onChangeText={setDesignation} placeholder="e.g. Rank marshal" />
      <Field label="Why should you manage this rank?" value={motivation} onChangeText={setMotivation} multiline />
      <Text style={styles.soon}>Supporting documents — coming soon</Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  list: { gap: 10 },
  rank: {
    flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, padding: 12,
    borderRadius: 14, borderWidth: 2, borderColor: 'transparent', backgroundColor: colors.surface,
  },
  rankOn: { borderColor: colors.ink },
  rankTaken: { opacity: 0.6 },
  rankText: { flex: 1, gap: 2 },
  rankName: { fontSize: 15, fontWeight: '700', color: colors.text },
  rankMeta: { fontSize: 13, color: colors.textSubtle },
  soon: { fontSize: 14, color: colors.textSubtle, borderWidth: 1, borderStyle: 'dashed', borderColor: '#b9b6ae', borderRadius: 12, padding: 14 },
});

export default ApplyScreen;
