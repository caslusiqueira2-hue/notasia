import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  timestamp
} from 'firebase/firestore';
import { useAuth } from './useAuth';

const APP_ID = 'smartnotes-ia';

export const useNotes = (colName = 'notes') => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCollectionPath = () => `artifacts/${APP_ID}/users/${user.uid}/${colName}`;

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, getCollectionPath()),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setData(items);
      setLoading(false);
    }, (error) => {
      console.error(`Error fetching ${colName}:`, error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, colName]);

  const add = async (item) => {
    return await addDoc(collection(db, getCollectionPath()), {
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const update = async (id, updates) => {
    const docRef = doc(db, getCollectionPath(), id);
    return await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  };

  const remove = async (id) => {
    const docRef = doc(db, getCollectionPath(), id);
    return await deleteDoc(docRef);
  };

  return { data, loading, add, update, remove };
};
