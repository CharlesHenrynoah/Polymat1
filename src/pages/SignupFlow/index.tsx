import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignupLevel1 } from './SignupLevel1';
import { SignupLevel2 } from './SignupLevel2';

interface SignupFlowProps {
  onBack: () => void;
}

export const SignupFlow: React.FC<SignupFlowProps> = ({ onBack }) => {
  const [level, setLevel] = useState(1);
  const [level1Data, setLevel1Data] = useState<any>(null);
  const navigate = useNavigate();

  const handleLevel1Complete = (data: any) => {
    setLevel1Data(data);
    setLevel(2);
  };

  const handleLevel2Complete = async (data: any) => {
    try {
      if (!level1Data?.userId) {
        throw new Error('ID utilisateur manquant');
      }
      
      // Redirection immédiate vers workspace
      navigate('/workspace');
      
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
    }
  };

  if (level === 1) {
    return <SignupLevel1 onNext={handleLevel1Complete} onBack={onBack} />;
  }

  return (
    <SignupLevel2 
      onComplete={handleLevel2Complete} 
      onBack={() => setLevel(1)} 
      userId={level1Data?.userId}
    />
  );
};