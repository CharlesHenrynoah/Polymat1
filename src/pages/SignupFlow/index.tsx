import { useState } from 'react';
import { SignupLevel1 } from './SignupLevel1';
import { SignupLevel2 } from './SignupLevel2';

// Interface commune pour les données d'inscription
export interface SignupData {
  email?: string;
  name?: string;
  avatar?: string;
  id?: string;
}

// Interfaces pour les props des composants
export interface SignupLevel1Props {
  onSubmit: (data: SignupData) => void;
  initialData: SignupData;
}

export interface SignupLevel2Props {
  data: SignupData;
  onComplete: (data: SignupData) => void;
  onBack: () => void;
}

export const SignupFlow = () => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [signupData, setSignupData] = useState<SignupData>({});

  const handleLevel1Complete = (data: SignupData) => {
    setSignupData(data);
    setCurrentLevel(2);
  };

  const handleBack = () => {
    setCurrentLevel(1);
  };

  const handleComplete = (data: SignupData) => {
    console.log('Inscription terminée:', { ...signupData, ...data });
  };

  return (
    <div>
      {currentLevel === 1 && (
        <SignupLevel1 
          onSubmit={handleLevel1Complete}
          initialData={signupData}
        />
      )}
      {currentLevel === 2 && (
        <SignupLevel2 
          data={signupData}  // Passez les données comme une prop unique
          onComplete={handleComplete}
          onBack={handleBack}
        />
      )}
    </div>
  );
};

export default SignupFlow;