// prettier-ignore
const translation = {
  Global: {
    EnterPin: 'Entrer le code PIN',
    EnterNewPin: 'Entrez le nouveau NIP',
    SixDigitPin: 'PIN à 6 chiffres',
    Submit: 'Soumettre',
    Cancel: 'Annuler',
    Confirm: 'Confirmer',
    Accept: 'Accepter',
    Reject: 'Rejeter',
    Share: 'Partager',
    Decline: 'Refuser',
    Back: 'Retour',
    Next: 'Suivant',
    Continue: 'Continuer',
    Info: 'Information',
    Failure: 'Échec',
    Success: 'Succès',
    SomethingWentWrong: "Quelque chose s'est mal passé",
    Done: 'Terminé',
    Skip: 'Ignorer',
    Previous: 'Précédente',
    View: 'Voir',
    Home: 'Accueil',
    ErrorCode: "Code d'erreur",
    Okay: 'Okay',
    Verify: 'Vérifier',
    ChangePin: 'Changer de code PIN',
    OldPin: "Saisir l'ancien code PIN",
    Copy: 'Copie',
    from: 'à partir de',
    Yes: 'Oui',
    No: 'Non',
    ThisDecisionCannotBeChanged: 'Cette décision ne peut être modifiée.',
    ZeroRecords: 'Aucun enregistrement disponible',
    ImportWallet: 'Importer un portefeuille',
    UserInactivity: "Déconnexion en raison de l'inactivité",
  },
  Language: {
    English: 'Anglais',
    French: 'Français',
    German: 'Allemand',
  },
  Registration:{
    RegisterAgain: 'Veuillez vous inscrire à nouveau',
    MnemonicMsg: "Cette phrase est le seul moyen d'exporter et d'importer un portefeuille, enregistrez-le dans un endroit sûr et secret. La phrase peut être trouvée plus tard sous l'onglet Paramètres",
    Passphrase: 'Mot de passe',
    Mnemonic: 'Mnémonique',
    SecondCounter: 'Deuxième à gauche',
    WalletInitialized:'Portefeuille initialisé avec succès.',
  },
  Terms: {
    AcceptTerms: 'This software is licensed as open source software under the <apachelink>Apache License Version 2.0</apachelink> and is governed by a firm commitment to your privacy and personal data, as explained in detail in our <privacylink>Privacy Policy</privacylink>.',
    AcceptTermsContinue: 'Please only continue, in case you have noted and accepted the indicated documents.',
  },
  PinCreate: {
    UserAuthenticationPin: "PIN d'authentification de l'utilisateur",
    PinMustBe6DigitsInLength: 'Le code PIN doit comporter 6 chiffres',
    ReEnterPinMustBe6DigitsInLength: 'Longueur du code PIN insuffisante',
    PinsEnteredDoNotMatch: 'Les codes PIN saisis ne correspondent pas',
    PinsSuccess: 'Code PIN créée avec succès',
    PinChange: 'Changement de code PIN réussi',
    NewPinMatchWithOld: "Le nouveau code PIN est identique à l'ancien",
    SixDigitPin: 'Code PIN à 6 chiffres',
    ReenterPin: 'Entrez à nouveau le code PIN',
    ReenterNewPin: 'Entrez à nouveau le nouveau code PIN',
    Create: 'Créer',
    ValidOldPin: 'Veuillez saisir un ancien code PIN valide',
    WalletCreated: 'Le portefeuille est créé avec succès',
    OR: 'OU',
    PinInfo: 'Ce code PIN est utilisée pour la connexion',
    ChangePin: 'Modifier votre code PIN',
  },
  Biometric: {
    Biometric: 'Biométrique',
    BiometricConfirm: "Confirmer l'empreinte digitale",
    BiometricSuccess: 'Empreinte digitale configurée avec succès',
    BiometricFailed: "Échec de l'identification biométrique",
    BiometricCancel: "L'utilisateur a annulé l'identification biométrique",
    BiometricNotSupport: 'Biométrie non prise en charge',
    RegisterPinandBiometric: 'Enregistrer le code PIN et la biométrie',
    BiometricInfo: "S'inscrire Utilisation biométrique pour la connexion",
  },
  Initialization:{
    CompleteInitialization:"Terminer l'initialisation",
    InitializationInfo:"Initialiser le nouveau portefeuille ou importer l'ancien portefeuille",
    ImportWalletBtn: 'Import Wallet',
    InitializationBtn: 'Initialization',
  },
  Mnemonic:{
    MnemonicTitle:'Ci-dessous le mnémonique pour les futures références',
  },
  Home: {
    Welcome: 'Bienvenue',
    Notifications: 'Notifications',
    NoNewUpdates: "Il n'y a pas de nouvelle notification.",
    NoCredentials: "Il n'y a pas d'informations d'identification dans le portefeuille.",
    SeeAll: 'Voir tous',
    YouHave: 'Vous avez',
    Credential: "Identifiant",
    Credentials: "Identifiants",
    InYourWallet: 'dans votre portefeuille',
    CredentialCountUndefinedError: "Il ne peut pas ne pas y avoir d'identifiants",
  },
  PinEnter: {
    IncorrectPin: 'Code PIN incorrect',
  },
  Settings: {
    ChangePin: 'Changer le code PIN',
    Version: 'Version',
    AppPreferences: "Préférences de l'application",
    AboutApp: "À propos de l'application",
    Language: 'Langue',
    Logout: 'Se déconnecter',
    LogoutMsg: 'Veuillez confirmer pour vous déconnecter',
    MnemonicMsg: 'Le mnémonique ne peut pas être vide',
    EnterMnemonic: 'Entrez le mnémonique',
    ValidMnemonic: 'Mnémonique valide',
    InvalidMnemonic: 'Mnémonique invalide',
    LegalAndPrivacy: 'Legal & Privacy',
    ExportWallet: "Portefeuille d'exportation",
    ViewMnemonic: 'Voir Mnémonique',
    RemoveDataTitle: 'Delete account',
    RemoveDataButton: 'Remove All Data',
    RemoveDataMsg: 'You are going to remove the wallet from your phone. The added connections and credentials will be removed from the app. Are you sure to continue?',
  },
  OTPTokens: {
    NoTokens: "Aucun jeton disponible",
  },
  ExportWallet:{
    WalletExportedPath: 'Portefeuille exporté vers le chemin :',
  },
  ImportWallet:{
    SelectWalletFile: 'Sélectionnez le fichier de portefeuille',
    EmptyMnemonic: 'Les mnémoniques ne peuvent pas être vides',
    InvalidMnemonic: 'Mnémoniques invalides ',
    WalletRestoreFailed:'Échec de la restauration du portefeuille',
    ImportError: 'Votre e-mail ou mnémonique est incorrect, veuillez le vérifier attentivement',
  },
  ConnectionInvitation: {
    VerifyMessage: 'Vérifiez soigneusement les détails de connexion',
    ConsentMessage: 'Nouvelle demande de connexion',
  },
  ContactDetails: {
    Created: 'Créé',
    ConnectionState: 'État de la connexion',
    AContact: 'Un contact',
    DeleteConnection: 'Supprimer la connexion',
    DeleteConnectionAlert: 'Êtes-vous sûr de vouloir supprimer cette connexion ?',
    DeleteConnectionSuccess: 'La connexion a été supprimée avec succès',
    DeleteConnectionFailed: 'Échec de la suppression de la connexion',
    ConnectionCannotDelete: 'La connexion du médiateur ne peut pas être supprimée',
  },
  Credentials: {
    CredentialsNotFound: 'Identifiants introuvables',
  },
  CredentialDetails: {
    Id: 'Identifiant:',
    CreatedAt: 'Créé à:',
    Version: 'Version',
    Issued: 'Publié',
    RemoveFromWallet: 'Retirer du portefeuille',
  },
  CredentialOffer: {
    ThisIsTakingLongerThanExpected: 'Cela prend plus de temps que prévu. Revenez plus tard pour un nouvel identifiant.',
    RejectThisCredential: 'Refuser cet identifiant ?',
    AcceptingCredential: "Acceptation des informations d'identification",
    SuccessfullyAcceptedCredential: 'Accepté avec succès le Credential',
    RejectingCredential:"Rejeter les informations d'identification",
    SuccessfullyRejectedCredential:"L'identifiant a été rejeté avec succès",
    CredentialNotFound: 'Identifiant introuvable',
    CredentialAccepted: 'Titre accepté',
    CredentialRejected: 'Identifiant refusé',
    CredentialAddedToYourWallet: 'Identifiant ajouté au portefeuille',
    CredentialDeclined: 'Identifiant refusé',
    CredentialOnTheWay: 'Votre accréditation est en route',
    CredentialOffer: "Nouvelle offre d'accréditation",
    IsOfferingYouACredential: 'offre un diplôme',
  },
  TabStack: {
    Home: 'Maison',
    Connections: 'Connexion',
    Scan: 'Analyse',
    Credentials: 'Identifiants',
    Settings: 'Réglages',
  },
  Toasts:{
    Success: 'Succès',
    Error: 'Erreur',
    Info: 'Info',
    Warning: 'Avertissement',
  },
  ProofRequest: {
    Title: '<b>{{connection}}</b> demande une vérification au Wallet. \n\nIls demandent à partager:',
    OfferDelay: "Retard de l'offre",
    RejectThisProof: 'Rejeter cette preuve ?',
    AcceptingProof: 'Acceptation de la preuve',
    SuccessfullyAcceptedProof: 'Preuve acceptée avec succès',
    ProofNotFound: 'Preuve introuvable',
    RejectingProof: 'Rejet de la preuve',
    ProofAccepted: 'Preuve acceptée',
    ProofRejected: 'Preuve rejetée',
    RequestedCredentialsCouldNotBeFound: "Les informations d'identification demandées sont introuvables",
    ProofRequest: 'Nouvelle demande de preuve',
    NotAvailableInYourWallet: 'Non disponible dans le portefeuille?0',
    IsRequestng: 'Rejeter cette preuve ?1',
    IsRequestingSomethingYouDontHaveAvailable: "Demande quelque chose qui n'est pas disponible dans le portefeuille?2",
    IsRequestingYouToShare: 'Rejeter cette preuve ?3',
    WhichYouCanProvideFrom: 'Qui peut être fourni par ?4',
    Details: 'Rejeter cette preuve ?5',
    SendingTheInformationSecurely: 'Rejeter cette preuve ?6',
    InformationSentSuccessfully: 'Rejeter cette preuve ?7',
    ProofRequestDeclined: 'Rejeter cette preuve ?8',
    ProofUpdateErrorTitle: 'Impossible de mettre à jour les identifiants récupérés',
    ProofUpdateErrorMessage: "Un problème est survenu lors de la mise à jour des informations d'identification récupérées",
    ProofAcceptErrorTitle: "Impossible d'accepter la demande de justificatif",
    ProofAcceptErrorMessage: "Un problème est survenu lors de l'acceptation de la demande de preuve",
    ProofRejectErrorTitle: 'Impossible de rejeter la demande de justificatif',
    ProofRejectErrorMessage: 'Un problème est survenu lors du rejet de la demande de preuve ',
    MissingInformation: {
      Title: 'La demande ne peut pas être complétée',
      AlertMissingInformation: {
        Title: "Le portefeuille manque d'informations",
      },
    },
    ProofRequestParamsError:"Les poussettes d'itinéraire ProofRequest n'ont pas été correctement définies",
    FetchProofError:"Impossible de récupérer la preuve auprès de l'AFJ",
  },
  Record: {
    Hide: 'Cacher',
    Show: 'Montrer',
    HideAll: 'Cacher tout',
    Hidden: 'Caché',
  },
  QRScanner:{
    PermissionToUseCamera:"Autorisation d'utiliser l'appareil photo",
    PermissionMessage:'Nous avons besoin de votre autorisation pour utiliser votre appareil photo',
    ScanMessage: 'Scannez pour vous connecter',
    VerifyMessage:"N'analysez que des sources fiables et vérifiez soigneusement les détails de connexion",
    NotAValidURL:'URL non valide',
    NotBlankURL: 'Veuillez entrer une URL',
    InvalidQrCode:'QRCode invalide',
  },
  Onboarding: {
    Slide1Title: 'Credentials List',
    Slide1Text: 'Get the list of issued credentials',
    Slide2Title: 'Scan to connect',
    Slide2Text: 'Scan QR to connect to organizations',
    Slide3Title: 'Secure Storage',
    Slide3Text: 'Store your credentials securely in wallet',
  },
  ScreenTitles: {
    Onboarding: 'App Introduction',
    LegalAndPrivacy: 'Legal & Privacy',
    CreatePin: 'Créer un code PIN',
    Biometric: 'Biometric',
    Initialization: 'Initialisation',
    SetupDelay: 'Initialisation du portefeuille',
    WalletInitialized: 'Portefeuille initialisé',
    EnterPin: 'Code PIN',
    ListContacts: 'Connexions',
    Home: 'Accueil',
    Notifications: 'Notifications',
    ChangePin: 'Changer de PIN',
    Credentials: 'Identifiants',
    CredentialDetails: "Détails de l'identifiant",
    Settings: 'Settings',
    CredentialOffer: 'Credential Offer',
    ProofRequest: 'Demande de preuve',
    Language: 'Language',
    ExportWallet: 'Exporter le portefeuille',
    ImportWallet: 'Importer un portefeuille',
    ContactDetails: 'Connection Details',
    ViewMnemonic: 'Voir le mnémonique',
  },
  SearchBar: {
    placeholder: 'Rechercher'
  },
};
export default translation;
