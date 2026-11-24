# Ananke

Ananke on sovellus, jolla voi seurata päivän tehtäviä, kirjoittaa päiväkirjaa ja kerätä kokemuspisteitä. Sovelluksessa voi myös tehdä oman taitopuun opittujen taitojen uudelleenkertaamista varten.

## Käytetyt teknologiat

- **React Native** sovelluksen käyttöliittymän tekemiseen.
- **Expo** sovelluksen kehittämiseen ja käynnistämiseen.
- **TypeScript** ohjelmointikielenä.
- **Supabase** tietokantana ja kirjautumiseen. Tietokanta käyttää PostgreSQL:ää.
- **AsyncStorage** kirjautumistiedon säilyttämiseen puhelimessa.

## Sovelluksen osat

- **`App.tsx`** muistaa, mikä sivu on auki, ja näyttää kirjautumisnäkymän ennen tietojen lataamista. Se välittää sivuille niiden tiedot ja toiminnot. Kun tehtävän suoritus tallentuu tai profiilisivu avataan, profiilin tiedot haetaan uudelleen, jotta XP pysyy ajan tasalla.
- **`components/layout/AppLayout.tsx`** näyttää kaikilla sivuilla yhteisen yläosan, päivämäärän ja alavalikon. Valittu sivu erottuu muista. Jos yhteys Supabaseen ei ole valmis, näkymä kertoo tilanteen; virheessä käyttäjä voi yrittää yhteyttä uudelleen.
- **`components/screens/SignInScreen.tsx`** pyytää sähköpostin ja salasanan. Tyhjät kentät estetään ennen lähettämistä, ja lähetyksen ajaksi painike sekä kentät lukitaan. Kirjautumisvirhe näytetään lomakkeessa.
- **`components/screens/MainMenuScreen.tsx`** näyttää tämän päivän tehtävät ja laskee niistä tehdyt kappaleet sekä etenemisprosentin. Tehtävän painaminen merkitsee sen tehdyksi tai palauttaa keskeneräiseksi. Tehtävälistasta voi lisätä pohjatehtävän, jonka tiedoissa näkyvät kuvaus, kesto, XP ja ominaisuus. Jo lisätty pohjatehtävä poistuu kyseisen päivän valinnoista. Oman tehtävän voi lisätä tekstikentästä. Etusivulta pääsee myös suoraan päiväkirjaan.
- **`components/screens/DiaryScreen.tsx`** näyttää kuukausikalenterin, jossa viikonpäivät alkavat maanantaista. Nuolista vaihdetaan kuukautta ja päivästä valitaan merkinnän päivämäärä. Päivälle voi kirjoittaa ajatuksia ja antaa arvosanan nollasta kymmeneen. Kalenteripäivän piste kertoo, että päivälle on tallennettu sisältöä.
- **`components/screens/ProfileScreen.tsx`** näyttää käyttäjän nimen ja tittelin lisäksi tason ja kokonais XP:n. Ominaisuusriveiltä näkee kunkin ominaisuuden tason, XP:n ja etenemispalkin. Profiilin tiedot haetaan Supabasesta.
- **`components/screens/SkillTreeScreen.tsx`** näyttää ensin juuritaidot. Taitoa painamalla sen saa auki, jolloin näkyvät muistiinpanot, alataidot ja uuden alataidon lisäyspainike. Lomakkeessa valitaan nimi, muistiinpanot ja ylätaidon paikka. Taitopuun tyhjennys poistaa kaikki käyttäjän taidot, joten sovellus pyytää siihen ensin vahvistuksen.

## Miten sovellus toimii

### Kirjautuminen ja sovelluksen käynnistys

- **`components/hooks/useAppController.ts`** tarkistaa sovelluksen käynnistyessä tallennetun kirjautumisistunnon. Kirjautuneena se asettaa tietokannan käyttövalmiiksi ja käynnistää sivujen tietojen lataukset. Se hoitaa myös kirjautumisen, välittää tallennusvirheet käyttöliittymään ja mahdollistaa yhteyden uudelleenyrityksen.
- **`components/storage/supabaseClient.ts`** muodostaa Supabase-yhteyden projektin asetusten perusteella. Istunto säilytetään AsyncStoragella ja kirjautumistunniste uusitaan automaattisesti.

### Tehtävät, päiväkirja, profiili ja taidot

- **`components/hooks/useTaskLogic.ts`** hakee päivän tehtävät ja valmiit tehtäväpohjat erikseen. Se lisää oman tehtävän tai pohjasta luodun tehtävän ja tallentaa suoritusmerkinnän. Sama pohjatehtävä voidaan lisätä päivälle vain kerran, ja päällekkäiset lisäyspyynnöt estetään. Omasta custom tehtävästä ei saa XP:tä. Tietokannasta haettujn tehtävien XP on määritetty tietokantaab. Tehtävälistan tila päivittyy, kun tallennus onnistuu.
- **`components/hooks/useDiaryLogic.ts`** pitää muistissa eri päivien merkinnät sekä valitun päivän ja kuukauden. Muutokset näkyvät heti, mutta tallennus Supabaseen tehdään 500 millisekunnin tauon jälkeen. Näin kirjoittaminen ei tee tietokantapyyntöä jokaisesta näppäimen painalluksesta.
- **`components/hooks/useProfileLogic.ts`** hakee profiilin ja ominaisuustilastot Supabasesta. Tietoja voi hakea uudelleen esimerkiksi tehtävän suorittamisen tai profiilisivulle siirtymisen jälkeen.
- **`components/hooks/useSkillTreeLogic.ts`** lataa käyttäjän taidot, tallentaa uuden taidon ja tyhjentää taitopuun. Näkymä päivittää listan tallennuksen jälkeen.

Hookit hoitavat tietojen lataamisen ja tallentamisen, kun taas `screens`-kansion komponentit näyttävät tiedot ja käyttöliittymän sekä käsittelevät käyttäjän toimintoja. **`components/storage/`** sisältää varsinaiset Supabase-kyselyt. Tietovarastot muuntavat tietokannan tiedot sovelluksen käyttämiin tietoihin ja välittävät virheet eteenpäin näytettäviksi.

Kun tehtävä merkitään tehdyksi, sovellus tallentaa sen tilan Supabaseen. Tietokannan triggerit päivittävät tehtävästä saadun XP:n ja profiilin tilastot. Sen jälkeen sovellus hakee profiilin uudelleen, jotta pisteet päivittyvät näkyviin. Jos tehtävä merkitään takaisin keskeneräiseksi, myös tämä muutos tallennetaan.

## Käynnistäminen

1. Asenna riippuvuudet komennolla `npm install`.
2. Luo projektin juureen `.env.local`-tiedosto. Lisää siihen `EXPO_PUBLIC_SUPABASE_URL` ja `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Käynnistä sovellus komennolla `npm start`.

