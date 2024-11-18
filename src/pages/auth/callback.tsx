import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../config/configdb';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("Début du callback");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log("Session:", session);
        
        if (error) {
          console.error('Erreur de callback:', error);
          navigate('/signup');
          return;
        }

        if (session?.user) {
          // Créer l'objet userData
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name,
            avatar: session.user.user_metadata?.avatar_url
          };

          try {
            // Insérer dans la table users s'il n'existe pas déjà
            const { error: insertError } = await supabase
              .from('users')
              .upsert([
                { 
                  id: userData.id,
                  email: userData.email,
                  first_name: userData.name?.split(' ')[0] || '',
                  last_name: userData.name?.split(' ')[1] || '',
                  profile_image: userData.avatar,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  preferences: {
                    theme: 'dark',
                    language: 'en',
                    notifications: true
                  }
                }
              ], 
              { 
                onConflict: 'id',
                ignoreDuplicates: true 
              });

            if (insertError) {
              console.error('Erreur insertion user:', insertError);
            }
          } catch (dbError) {
            console.error('Erreur base de données:', dbError);
          }

          // Sauvegarder dans localStorage ET dans le contexte
          localStorage.setItem('signupData', JSON.stringify(userData));
          setUser(userData);

          // Vérifier si l'utilisateur a déjà complété son profil
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile?.username) {
            navigate(`/workspace/${profile.username}`);
          } else {
            navigate('/signup/level2', { state: userData });
          }
        } else {
          navigate('/signup');
        }
      } catch (error) {
        console.error('Erreur:', error);
        navigate('/signup');
      }
    };

    handleAuthCallback();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-zinc-400">Authentification en cours...</p>
      </div>
    </div>
  );
}
