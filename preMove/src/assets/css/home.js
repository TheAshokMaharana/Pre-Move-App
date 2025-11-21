// src/screens/HomeScreen.styles.js
import { StyleSheet } from 'react-native';
import colors from '../../theme/colors';

// Home page css

export default StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  container: { flex: 1 },
  brand: {
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 6,
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  textFlas: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.primarylow,
    borderRadius: 20,
    paddingVertical: 6,
    // paddingHorizontal: 10,
    gap: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    width: '88%',
    height: 180,
    alignSelf: 'center',
    marginVertical: 6,
  },
  live: {
    height: 50,
    textAlign: 'center',
    // marginTop: 12,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  citiescontainer: {
    width: '100%',
    justifyContent: 'center',
    marginVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  cities: {
    fontSize: 13,
    paddingHorizontal: 10,
  },
  meta: {
    textAlign: 'center',
    color: colors.muted,
    marginBottom: 10,
    fontSize: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  sectionTitle: {
    textAlign: 'center',
    marginTop: 18,
    fontWeight: '700',
    fontSize: 16,
    color: colors.text,
  },
  sectionSub: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 6,
    fontSize: 13,
  },
  maincardRow: { justifyContent: 'center', alignItems: 'center', gap: 30 },
  cardRow: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 18,
    marginVertical: 20,
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footer: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 25,
    color: colors.primary,
    fontFamily: '',
    fontWeight: 'bold',

  },
});
// Home page css close

//
