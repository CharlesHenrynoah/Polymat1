import { db } from './firebase_config';
import { collection, addDoc, getDocs } from 'firebase/firestore';

async function testFirebaseConnection() {
    try {
        // Test d'écriture
        const docRef = await addDoc(collection(db, "test"), {
            message: "Test de connexion",
            timestamp: new Date()
        });
        console.log("✅ Test d'écriture réussi - Document créé avec l'ID:", docRef.id);

        // Test de lecture
        const querySnapshot = await getDocs(collection(db, "test"));
        console.log("✅ Test de lecture réussi - Documents dans la collection:");
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
        });

    } catch (error) {
        console.error("❌ Erreur lors du test:", error);
    }
}

// Exécuter le test
testFirebaseConnection();