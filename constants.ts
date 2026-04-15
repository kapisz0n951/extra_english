
import { Word, AppLanguage, MainCategory, Chapter } from './types';

const generateMockWords = (baseId: string, plWords: string[], targetWords: string[]): Word[] => {
    return plWords.map((pl, i) => ({
        id: `${baseId}_${i}`,
        pl,
        en: targetWords[i]
    }));
};

export const MULTI_LANG_DATA: Record<AppLanguage, Partial<Record<MainCategory, Record<string, Word[]>>>> = {
    EN: {
        words: {
            pronouns: generateMockWords('en_pr', ['Ja', 'Ty', 'On', 'Ona', 'Ono', 'My', 'Wy', 'Oni', 'Mój', 'Twój'], ['I', 'You', 'He', 'She', 'It', 'We', 'You', 'They', 'My', 'Your']),
            animals: generateMockWords('en_an', ['Pies', 'Kot', 'Słoń', 'Lew', 'Tygrys', 'Żyrafa', 'Małpa', 'Zebra', 'Królik', 'Wilk', 'Niedźwiedź', 'Wąż', 'Ptak', 'Ryba', 'Koń'], ['Dog', 'Cat', 'Elephant', 'Lion', 'Tiger', 'Giraffe', 'Monkey', 'Zebra', 'Rabbit', 'Wolf', 'Bear', 'Snake', 'Bird', 'Fish', 'Horse']),
            food: generateMockWords('en_fo', ['Chleb', 'Jabłko', 'Woda', 'Ser', 'Mleko', 'Masło', 'Jajko', 'Mięso', 'Ryż', 'Zupa', 'Ciasto', 'Sok', 'Kawa', 'Herbata', 'Cukier'], ['Bread', 'Apple', 'Water', 'Cheese', 'Milk', 'Butter', 'Egg', 'Meat', 'Rice', 'Soup', 'Cake', 'Juice', 'Coffee', 'Tea', 'Sugar']),
            body: generateMockWords('en_bo', ['Głowa', 'Ręka', 'Noga', 'Oko', 'Ucho', 'Nos', 'Usta', 'Serce', 'Plecy', 'Brzuch', 'Palec', 'Kolano', 'Stopa', 'Szyja', 'Ramię'], ['Head', 'Hand', 'Leg', 'Eye', 'Ear', 'Noze', 'Mouth', 'Heart', 'Back', 'Stomach', 'Finger', 'Knee', 'Foot', 'Neck', 'Shoulder']),
            colors: generateMockWords('en_co', ['Czerwony', 'Niebieski', 'Zielony', 'Żółty', 'Czarny', 'Biały', 'Różowy', 'Pomarańczowy', 'Brązowy', 'Szary', 'Fioletowy', 'Złoty'], ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Pink', 'Orange', 'Brown', 'Grey', 'Purple', 'Gold']),
            family: generateMockWords('en_fa', ['Mama', 'Tata', 'Syn', 'Córka', 'Brat', 'Siostra', 'Babcia', 'Dziadek', 'Wujek', 'Ciocia', 'Kuzyn', 'Mąż', 'Żona'], ['Mother', 'Father', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandmother', 'Grandfather', 'Uncle', 'Aunt', 'Cousin', 'Husband', 'Wife']),
            numbers: generateMockWords('en_nu', ['Jeden', 'Dwa', 'Trzy', 'Cztery', 'Pięć', 'Sześć', 'Siedem', 'Osiem', 'Dziewięć', 'Dziesięć', 'Sto', 'Tysiąc'], ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Hundred', 'Thousand']),
            house: generateMockWords('en_ho', ['Dom', 'Okno', 'Drzwi', 'Dach', 'Pokój', 'Kuchnia', 'Łazienka', 'Sypialnia', 'Ogród', 'Garaż', 'Ściana', 'Podłoga'], ['House', 'Window', 'Door', 'Roof', 'Room', 'Kitchen', 'Bathroom', 'Bedroom', 'Garden', 'Garage', 'Wall', 'Floor']),
            travel: generateMockWords('en_tr', ['Samolot', 'Pociąg', 'Samochód', 'Statek', 'Rower', 'Bilet', 'Lotnisko', 'Hotel', 'Plaża', 'Góry', 'Mapa', 'Podróż'], ['Plane', 'Train', 'Car', 'Ship', 'Bicycle', 'Ticket', 'Airport', 'Hotel', 'Beach', 'Mountains', 'Map', 'Journey']),
            weather: generateMockWords('en_we', ['Słońce', 'Deszcz', 'Śnieg', 'Wiatr', 'Chmura', 'Burza', 'Gorąco', 'Zimno', 'Mgła', 'Tęcza', 'Niebo', 'Temperatura'], ['Sun', 'Rain', 'Snow', 'Wind', 'Cloud', 'Storm', 'Hot', 'Cold', 'Fog', 'Rainbow', 'Sky', 'Temperature']),
            jobs: generateMockWords('en_jo', ['Lekarz', 'Nauczyciel', 'Kierowca', 'Kucharz', 'Policjant', 'Strażak', 'Inżynier', 'Artysta', 'Pielęgniarka', 'Sprzedawca'], ['Doctor', 'Teacher', 'Driver', 'Cook', 'Policeman', 'Fireman', 'Engineer', 'Artist', 'Nurse', 'Seller']),
            emotions: generateMockWords('en_em', ['Szczęśliwy', 'Smutny', 'Zły', 'Zaskoczony', 'Zmęczony', 'Głodny', 'Zestresowany', 'Dumny', 'Spokojny', 'Zakochany'], ['Happy', 'Sad', 'Angry', 'Surprised', 'Tired', 'Hungry', 'Stressed', 'Proud', 'Calm', 'In love']),
            clothes: generateMockWords('en_cl', ['Koszulka', 'Spodnie', 'Sukienka', 'Buty', 'Kurtka', 'Czapka', 'Skarpetki', 'Sweter', 'Garnitur', 'Spódnica'], ['T-shirt', 'Pants', 'Dress', 'Shoes', 'Jacket', 'Hat', 'Socks', 'Sweater', 'Suit', 'Skirt']),
            nature: generateMockWords('en_na', ['Drzewo', 'Kwiat', 'Las', 'Rzeka', 'Jezioro', 'Morze', 'Góra', 'Pustynia', 'Wyspa', 'Trawa', 'Księżyc', 'Gwiazda'], ['Tree', 'Flower', 'Forest', 'River', 'Lake', 'Sea', 'Mountain', 'Desert', 'Island', 'Grass', 'Moon', 'Star']),
            kitchen: generateMockWords('en_ki', ['Widelec', 'Noż', 'Łyżka', 'Talerz', 'Kubek', 'Patelnia', 'Garnek', 'Lodówka', 'Piekarnik', 'Zmywarka'], ['Fork', 'Knife', 'Spoon', 'Plate', 'Cup', 'Pan', 'Pot', 'Fridge', 'Oven', 'Dishwasher']),
            city: generateMockWords('en_ci', ['Ulica', 'Budynek', 'Sklep', 'Park', 'Most', 'Kino', 'Teatr', 'Szpital', 'Szkoła', 'Bank', 'Restauracja', 'Kościół'], ['Street', 'Building', 'Shop', 'Park', 'Bridge', 'Cinema', 'Theatre', 'Hospital', 'School', 'Bank', 'Restaurant', 'Church']),
            health: generateMockWords('en_he', ['Zdrowie', 'Choroba', 'Lek', 'Ból', 'Szpital', 'Apteka', 'Recepta', 'Gorączka', 'Krew', 'Witaminy'], ['Health', 'Illness', 'Medicine', 'Pain', 'Hospital', 'Pharmacy', 'Prescription', 'Fever', 'Blood', 'Vitamins']),
            shopping: generateMockWords('en_sh', ['Cena', 'Pieniądze', 'Karta', 'Gotówka', 'Torba', 'Promocja', 'Kupować', 'Sprzedawać', 'Paragon', 'Koszyk'], ['Price', 'Money', 'Card', 'Cash', 'Bag', 'Sale', 'Buy', 'Sell', 'Receipt', 'Basket']),
            hobbies: generateMockWords('en_hb', ['Sport', 'Muzyka', 'Taniec', 'Czytanie', 'Gry', 'Podróże', 'Gotowanie', 'Rysowanie', 'Fotografia', 'Film'], ['Sport', 'Music', 'Dance', 'Reading', 'Games', 'Travel', 'Cooking', 'Drawing', 'Photography', 'Movie']),
            tech: generateMockWords('en_te', ['Komputer', 'Telefon', 'Internet', 'Ekran', 'Myszka', 'Klawiatura', 'Aplikacja', 'Hasło', 'Strona', 'Dane'], ['Computer', 'Phone', 'Internet', 'Screen', 'Mouse', 'Keyboard', 'Application', 'Password', 'Website', 'Data']),
        },
        phrases: {
            greetings: [
                { id: 'g1', pl: 'Dzień dobry', en: 'Good morning' }, { id: 'g2', pl: 'Cześć', en: 'Hello' },
                { id: 'g3', pl: 'Jak się masz?', en: 'How are you?' }, { id: 'g4', pl: 'Dobrze, dziękuję', en: 'Fine, thank you' },
                { id: 'g5', pl: 'Do widzenia', en: 'Goodbye' }, { id: 'g6', pl: 'Proszę', en: 'Please' },
                { id: 'g7', pl: 'Dziękuję', en: 'Thank you' }, { id: 'g8', pl: 'Przepraszam', en: 'I am sorry' }
            ]
        }
    },
    ES: {
        words: {
            pronouns: generateMockWords('es_pr', ['Ja', 'Ty', 'On', 'Ona', 'Ono', 'My', 'Wy', 'Oni', 'Mój', 'Twój'], ['Yo', 'Tú', 'Él', 'Ella', 'Ello', 'Nosotros', 'Vosotros', 'Ellos', 'Mi', 'Tu']),
            animals: generateMockWords('es_an', ['Pies', 'Kot', 'Słoń', 'Lew', 'Tygrys', 'Żyrafa', 'Małpa', 'Zebra', 'Królik', 'Wilk', 'Niedźwiedź', 'Wąż', 'Ptak', 'Ryba', 'Koń'], ['Perro', 'Gato', 'Elefante', 'León', 'Tigre', 'Jirafa', 'Mono', 'Cebra', 'Conejo', 'Lobo', 'Oso', 'Serpiente', 'Pájaro', 'Pez', 'Caballo']),
            food: generateMockWords('es_fo', ['Chleb', 'Jabłko', 'Woda', 'Ser', 'Mleko', 'Masło', 'Jajko', 'Mięso', 'Ryż', 'Zupa', 'Ciasto', 'Sok', 'Kawa', 'Herbata', 'Cukier'], ['Pan', 'Manzana', 'Agua', 'Queso', 'Leche', 'Mantequilla', 'Huevo', 'Carne', 'Arroz', 'Sopa', 'Pastel', 'Zumo', 'Café', 'Té', 'Azúcar']),
            body: generateMockWords('es_bo', ['Głowa', 'Ręka', 'Noga', 'Oko', 'Ucho', 'Nos', 'Usta', 'Serce', 'Plecy', 'Brzuch', 'Palec', 'Kolano', 'Stopa', 'Szyja', 'Ramię'], ['Cabeza', 'Mano', 'Pierna', 'Ojo', 'Oreja', 'Nariz', 'Boca', 'Corazón', 'Espalda', 'Estómago', 'Dedo', 'Rodilla', 'Pie', 'Cuello', 'Hombro']),
            colors: generateMockWords('es_co', ['Czerwony', 'Niebieski', 'Zielony', 'Żółty', 'Czarny', 'Biały', 'Różowy', 'Pomarańczowy', 'Brązowy', 'Szary', 'Fioletowy', 'Złoty'], ['Rojo', 'Azul', 'Verde', 'Amarillo', 'Negro', 'Blanco', 'Rosa', 'Naranja', 'Marrón', 'Gris', 'Púrpura', 'Dorado']),
            family: generateMockWords('es_fa', ['Mama', 'Tata', 'Syn', 'Córka', 'Brat', 'Siostra', 'Babcia', 'Dziadek', 'Wujek', 'Ciocia', 'Kuzyn', 'Mąż', 'Żona'], ['Madre', 'Padre', 'Hijo', 'Hija', 'Hermano', 'Hermana', 'Abuela', 'Abuelo', 'Tío', 'Tía', 'Primo', 'Esposo', 'Esposa']),
            numbers: generateMockWords('es_nu', ['Jeden', 'Dwa', 'Trzy', 'Cztery', 'Pięć', 'Sześć', 'Siedem', 'Osiem', 'Dziewięć', 'Dziesięć', 'Sto', 'Tysiąc'], ['Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez', 'Cien', 'Mil']),
            house: generateMockWords('es_ho', ['Dom', 'Okno', 'Drzwi', 'Dach', 'Pokój', 'Kuchnia', 'Łazienka', 'Sypialnia', 'Ogród', 'Garaż', 'Ściana', 'Podłoga'], ['Casa', 'Ventana', 'Puerta', 'Techo', 'Habitación', 'Cocina', 'Baño', 'Dormitorio', 'Jardín', 'Garaje', 'Pared', 'Suelo']),
            travel: generateMockWords('es_tr', ['Samolot', 'Pociąg', 'Samochód', 'Statek', 'Rower', 'Bilet', 'Lotnisko', 'Hotel', 'Plaża', 'Góry', 'Mapa', 'Podróż'], ['Avión', 'Tren', 'Coche', 'Barco', 'Bicicleta', 'Billete', 'Aeropuerto', 'Hotel', 'Playa', 'Montaña', 'Mapa', 'Viaje']),
            weather: generateMockWords('es_we', ['Słońce', 'Deszcz', 'Śnieg', 'Wiatr', 'Chmura', 'Burza', 'Gorąco', 'Zimno', 'Mgła', 'Tęcza', 'Niebo', 'Temperatura'], ['Sol', 'Lluvia', 'Nieve', 'Viento', 'Nube', 'Tormenta', 'Calor', 'Frío', 'Niebla', 'Arcoíris', 'Cielo', 'Temperatura']),
            jobs: generateMockWords('es_jo', ['Lekarz', 'Nauczyciel', 'Kierowca', 'Kucharz', 'Policjant', 'Strażak', 'Inżynier', 'Artysta', 'Pielęgniarka', 'Sprzedawca'], ['Médico', 'Profesor', 'Conductor', 'Cocinero', 'Policía', 'Bombero', 'Ingeniero', 'Artista', 'Enfermera', 'Vendedor']),
            emotions: generateMockWords('es_em', ['Szczęśliwy', 'Smutny', 'Zły', 'Zaskoczony', 'Zmęczony', 'Głodny', 'Zestresowany', 'Dumny', 'Spokojny', 'Zakochany'], ['Feliz', 'Triste', 'Enfadado', 'Sorprendido', 'Cansado', 'Hambriento', 'Estresado', 'Orgulloso', 'Calmado', 'Enamorado']),
            clothes: generateMockWords('es_cl', ['Koszulka', 'Spodnie', 'Sukienka', 'Buty', 'Kurtka', 'Czapka', 'Skarpetki', 'Sweter', 'Garnitur', 'Spódnica'], ['Camiseta', 'Pantalones', 'Vestido', 'Zapatos', 'Chaqueta', 'Gorra', 'Calcetines', 'Suéter', 'Traje', 'Falda']),
            nature: generateMockWords('es_na', ['Drzewo', 'Kwiat', 'Las', 'Rzeka', 'Jezioro', 'Morze', 'Góra', 'Pustynia', 'Wyspa', 'Trawa', 'Księżyc', 'Gwiazda'], ['Árbol', 'Flor', 'Bosque', 'Río', 'Lago', 'Mar', 'Montaña', 'Desierto', 'Isla', 'Hierba', 'Luna', 'Estrella']),
            kitchen: generateMockWords('es_ki', ['Widelec', 'Noż', 'Łyżka', 'Talerz', 'Kubek', 'Patelnia', 'Garnek', 'Lodówka', 'Piekarnik', 'Zmywarka'], ['Tenedor', 'Cuchillo', 'Cuchara', 'Plato', 'Taza', 'Sartén', 'Olla', 'Nevera', 'Horno', 'Lavavajillas']),
            city: generateMockWords('es_ci', ['Ulica', 'Budynek', 'Sklep', 'Park', 'Most', 'Kino', 'Teatr', 'Szpital', 'Szkoła', 'Bank', 'Restauracja', 'Kościół'], ['Calle', 'Edificio', 'Tienda', 'Parque', 'Puente', 'Cine', 'Teatro', 'Hospital', 'Escuela', 'Banco', 'Restaurante', 'Iglesia']),
            health: generateMockWords('es_he', ['Zdrowie', 'Choroba', 'Lek', 'Ból', 'Szpital', 'Apteka', 'Recepta', 'Gorączka', 'Krew', 'Witaminy'], ['Salud', 'Enfermedad', 'Medicina', 'Dolor', 'Hospital', 'Farmacia', 'Receta', 'Fiebre', 'Sangre', 'Vitaminas']),
            shopping: generateMockWords('es_sh', ['Cena', 'Pieniądze', 'Karta', 'Gotówka', 'Torba', 'Promocja', 'Kupować', 'Sprzedawać', 'Paragon', 'Koszyk'], ['Precio', 'Dinero', 'Tarjeta', 'Efectivo', 'Bolsa', 'Venta', 'Comprar', 'Vender', 'Recibo', 'Cesta']),
            hobbies: generateMockWords('es_hb', ['Sport', 'Muzyka', 'Taniec', 'Czytanie', 'Gry', 'Podróże', 'Gotowanie', 'Rysowanie', 'Fotografia', 'Film'], ['Deporte', 'Música', 'Baile', 'Lectura', 'Juegos', 'Viajes', 'Cocina', 'Dibujo', 'Fotografía', 'Película']),
            tech: generateMockWords('es_te', ['Komputer', 'Telefon', 'Internet', 'Ekran', 'Myszka', 'Klawiatura', 'Aplikacja', 'Hasło', 'Strona', 'Dane'], ['Ordenador', 'Teléfono', 'Internet', 'Pantalla', 'Ratón', 'Teclado', 'Aplicación', 'Contraseña', 'Página', 'Datos']),
        },
        phrases: {
            greetings: [
                { id: 'eg1', pl: 'Dzień dobry', en: 'Buenos días' }, { id: 'eg2', pl: 'Cześć', en: 'Hola' },
                { id: 'eg3', pl: 'Jak się masz?', en: '¿Cómo estás?' }, { id: 'eg4', pl: 'Dobrze, dziękuję', en: 'Bien, gracias' },
                { id: 'eg5', pl: 'Do widzenia', en: 'Adiós' }, { id: 'eg6', pl: 'Proszę', en: 'Por favor' },
                { id: 'eg7', pl: 'Dziękuję', en: 'Gracias' }, { id: 'eg8', pl: 'Przepraszam', en: 'Lo siento' }
            ]
        }
    }
};

export const ENGLISH_CHAPTERS: Chapter[] = [
    { id: 'en_1', title: 'Zaimki Osobowe', category: 'pronouns', mainCategory: 'words', requiredLevel: 1, icon: '👤', difficulty: 'easy' },
    { id: 'en_2', title: 'Być (To Be)', category: 'Czasownik "To Be"', mainCategory: 'lesson', requiredLevel: 1, icon: '✨', difficulty: 'easy' },
    { id: 'en_3', title: 'Zwierzęta', category: 'animals', mainCategory: 'words', requiredLevel: 1, icon: '🐶', difficulty: 'easy' },
    { id: 'en_4', title: 'Kolory', category: 'colors', mainCategory: 'words', requiredLevel: 1, icon: '🎨', difficulty: 'easy' },
    { id: 'en_5', title: 'Jedzenie', category: 'food', mainCategory: 'words', requiredLevel: 1, icon: '🍎', difficulty: 'easy' },
    { id: 'en_6', title: 'Rodzina', category: 'family', mainCategory: 'words', requiredLevel: 1, icon: '👪', difficulty: 'easy' },
    { id: 'en_7', title: 'Liczby', category: 'numbers', mainCategory: 'words', requiredLevel: 1, icon: '🔢', difficulty: 'easy' },
    { id: 'en_8', title: 'Części Ciała', category: 'body', mainCategory: 'words', requiredLevel: 1, icon: '💪', difficulty: 'easy' },
    { id: 'en_9', title: 'Dom', category: 'house', mainCategory: 'words', requiredLevel: 1, icon: '🏠', difficulty: 'easy' },
    { id: 'en_10', title: 'Pogoda', category: 'weather', mainCategory: 'words', requiredLevel: 1, icon: '☁️', difficulty: 'normal' },
    { id: 'en_11', title: 'Podróże', category: 'travel', mainCategory: 'words', requiredLevel: 1, icon: '✈️', difficulty: 'normal' },
    { id: 'en_12', title: 'Zawody', category: 'jobs', mainCategory: 'words', requiredLevel: 1, icon: '💼', difficulty: 'normal' },
    { id: 'en_13', title: 'Emocje', category: 'emotions', mainCategory: 'words', requiredLevel: 1, icon: '🎭', difficulty: 'normal' },
    { id: 'en_14', title: 'Ubrania', category: 'clothes', mainCategory: 'words', requiredLevel: 1, icon: '👕', difficulty: 'normal' },
    { id: 'en_15', title: 'Natura', category: 'nature', mainCategory: 'words', requiredLevel: 1, icon: '🌳', difficulty: 'normal' },
    { id: 'en_16', title: 'Kuchnia', category: 'kitchen', mainCategory: 'words', requiredLevel: 1, icon: '🍴', difficulty: 'normal' },
    { id: 'en_17', title: 'Miasto', category: 'city', mainCategory: 'words', requiredLevel: 1, icon: '🏙️', difficulty: 'normal' },
    { id: 'en_18', title: 'Zdrowie', category: 'health', mainCategory: 'words', requiredLevel: 1, icon: '🏥', difficulty: 'normal' },
    { id: 'en_19', title: 'Zakupy', category: 'shopping', mainCategory: 'words', requiredLevel: 1, icon: '🛍️', difficulty: 'normal' },
    { id: 'en_20', title: 'Hobby', category: 'hobbies', mainCategory: 'words', requiredLevel: 1, icon: '🎸', difficulty: 'normal' },
    { id: 'en_21', title: 'Technologia', category: 'tech', mainCategory: 'words', requiredLevel: 1, icon: '💻', difficulty: 'hard' },
];

export const SPANISH_CHAPTERS: Chapter[] = [
    { id: 'es_1', title: 'Powitania', category: 'greetings', mainCategory: 'phrases', requiredLevel: 1, icon: '👋', difficulty: 'easy' },
    { id: 'es_2', title: 'Zaimki', category: 'pronouns', mainCategory: 'words', requiredLevel: 1, icon: '👤', difficulty: 'easy' },
    { id: 'es_3', title: 'Zwierzęta', category: 'animals', mainCategory: 'words', requiredLevel: 1, icon: '🦁', difficulty: 'easy' },
    { id: 'es_4', title: 'Kolory', category: 'colors', mainCategory: 'words', requiredLevel: 1, icon: '🌈', difficulty: 'easy' },
    { id: 'es_5', title: 'Jedzenie', category: 'food', mainCategory: 'words', requiredLevel: 1, icon: '🥘', difficulty: 'easy' },
    { id: 'es_6', title: 'Rodzina', category: 'family', mainCategory: 'words', requiredLevel: 1, icon: '👵', difficulty: 'easy' },
    { id: 'es_7', title: 'Liczby', category: 'numbers', mainCategory: 'words', requiredLevel: 1, icon: '🔟', difficulty: 'easy' },
    { id: 'es_8', title: 'Ciało', category: 'body', mainCategory: 'words', requiredLevel: 1, icon: '👂', difficulty: 'easy' },
    { id: 'es_9', title: 'Dom', category: 'house', mainCategory: 'words', requiredLevel: 1, icon: '🏘️', difficulty: 'easy' },
    { id: 'es_10', title: 'Pogoda', category: 'weather', mainCategory: 'words', requiredLevel: 1, icon: '☀️', difficulty: 'normal' },
    { id: 'es_11', title: 'Podróże', category: 'travel', mainCategory: 'words', requiredLevel: 1, icon: '🚢', difficulty: 'normal' },
    { id: 'es_12', title: 'Zawody', category: 'jobs', mainCategory: 'words', requiredLevel: 1, icon: '👩‍⚕️', difficulty: 'normal' },
    { id: 'es_13', title: 'Emocje', category: 'emotions', mainCategory: 'words', requiredLevel: 1, icon: '🥺', difficulty: 'normal' },
    { id: 'es_14', title: 'Ubrania', category: 'clothes', mainCategory: 'words', requiredLevel: 1, icon: '👗', difficulty: 'normal' },
    { id: 'es_15', title: 'Natura', category: 'nature', mainCategory: 'words', requiredLevel: 1, icon: '🌵', difficulty: 'normal' },
    { id: 'es_16', title: 'Kuchnia', category: 'kitchen', mainCategory: 'words', requiredLevel: 1, icon: '🍳', difficulty: 'normal' },
    { id: 'es_17', title: 'Miasto', category: 'city', mainCategory: 'words', requiredLevel: 1, icon: '⛪', difficulty: 'normal' },
    { id: 'es_18', title: 'Zdrowie', category: 'health', mainCategory: 'words', requiredLevel: 1, icon: '💊', difficulty: 'normal' },
    { id: 'es_19', title: 'Zakupy', category: 'shopping', mainCategory: 'words', requiredLevel: 1, icon: '💳', difficulty: 'normal' },
    { id: 'es_20', title: 'Hobby', category: 'hobbies', mainCategory: 'words', requiredLevel: 1, icon: '💃', difficulty: 'normal' },
    { id: 'es_21', title: 'Technologia', category: 'tech', mainCategory: 'words', requiredLevel: 1, icon: '📱', difficulty: 'hard' },
];

export const TOTAL_QUESTIONS = 12;
