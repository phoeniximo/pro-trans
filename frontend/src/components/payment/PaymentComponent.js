import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import apiClient from '../../api/client';

const PaymentComponent = ({ devisId, montant, onPaymentComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvc: '',
    saveCard: false
  });
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showForm, setShowForm] = useState(true);

  // Fetch saved payment methods on component mount
  useEffect(() => {
    const fetchSavedCards = async () => {
      try {
        const response = await apiClient.get('/payment-methods');
        setSavedCards(response.data.data);
        if (response.data.data.length > 0) {
          setShowForm(false);
        }
      } catch (err) {
        console.error('Error fetching saved cards:', err);
        // Don't set error here, just log it
      }
    };

    fetchSavedCards();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle payment method selection
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setError(null);
  };

  // Handle saved card selection
  const handleCardSelection = (cardId) => {
    setSelectedCard(cardId);
    setError(null);
  };

  // Show new card form
  const handleShowNewCardForm = () => {
    setShowForm(true);
    setSelectedCard(null);
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    return value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim();
  };

  // Format expiry date (MM/YY)
  const formatExpiry = (value) => {
    return value
      .replace(/\//g, '')
      .replace(/(\d{2})(\d{0,2})/, '$1/$2')
      .trim();
  };

  // Validate card number (basic)
  const isCardNumberValid = (cardNumber) => {
    const regex = /^(\d{4}\s){3}\d{4}$/;
    return regex.test(cardNumber);
  };

  // Validate expiry date
  const isExpiryValid = (expiry) => {
    if (!expiry) return false;
    
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(expiry)) return false;
    
    const [month, year] = expiry.split('/');
    const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const today = new Date();
    
    return expDate > today;
  };

  // Validate CVC
  const isCvcValid = (cvc) => {
    const regex = /^\d{3,4}$/;
    return regex.test(cvc);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate the payment information
      if (paymentMethod === 'card' && showForm) {
        // Form validation for new card
        if (!isCardNumberValid(formData.cardNumber)) {
          throw new Error('Numéro de carte invalide');
        }
        if (!isExpiryValid(formData.expiry)) {
          throw new Error('Date d\'expiration invalide');
        }
        if (!isCvcValid(formData.cvc)) {
          throw new Error('Code de sécurité invalide');
        }
        if (!formData.cardName) {
          throw new Error('Veuillez entrer le nom sur la carte');
        }
      }

      // Prepare payment data
      const paymentData = {
        devisId,
        montant,
        methodePaiement: paymentMethod,
        ...(paymentMethod === 'card' && {
          carte: selectedCard 
            ? { id: selectedCard } 
            : {
                numero: formData.cardNumber.replace(/\s/g, ''),
                nom: formData.cardName,
                expiration: formData.expiry,
                cvc: formData.cvc,
                sauvegarder: formData.saveCard
              }
        })
      };

      // Send payment request to the API
      const response = await apiClient.post('/payments', paymentData);

      toast.success('Paiement effectué avec succès !');
      
      // Call the onPaymentComplete callback
      if (onPaymentComplete) {
        onPaymentComplete(response.data.data);
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err.response?.data?.message || err.message || 'Une erreur est survenue lors du paiement');
      toast.error(err.response?.data?.message || err.message || 'Échec du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Paiement</h2>
      
      {/* Payment Amount */}
      <div className="bg-gray-50 rounded-md p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Montant à payer :</span>
          <span className="text-xl font-bold">{montant.toFixed(2)} €</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Méthode de paiement
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div
              className={`border rounded-md p-3 text-center cursor-pointer transition-colors ${
                paymentMethod === 'card'
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handlePaymentMethodChange('card')}
            >
              <CreditCardIcon className="h-6 w-6 mx-auto mb-1" />
              <span className="text-sm">Carte bancaire</span>
            </div>
            <div
              className={`border rounded-md p-3 text-center cursor-pointer transition-colors ${
                paymentMethod === 'virement'
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handlePaymentMethodChange('virement')}
            >
              <BuildingLibraryIcon className="h-6 w-6 mx-auto mb-1" />
              <span className="text-sm">Virement bancaire</span>
            </div>
            <div
              className={`border rounded-md p-3 text-center cursor-pointer transition-colors ${
                paymentMethod === 'paypal'
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handlePaymentMethodChange('paypal')}
            >
              <BanknotesIcon className="h-6 w-6 mx-auto mb-1" />
              <span className="text-sm">PayPal</span>
            </div>
          </div>
        </div>

        {/* Credit Card Payment */}
        {paymentMethod === 'card' && (
          <>
            {/* Saved Cards */}
            {savedCards.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Cartes enregistrées
                </label>
                <div className="space-y-3">
                  {savedCards.map((card) => (
                    <div
                      key={card.id}
                      className={`border rounded-md p-3 cursor-pointer transition-colors ${
                        selectedCard === card.id
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => handleCardSelection(card.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <CreditCardIcon className="h-5 w-5 mr-2 text-gray-500" />
                          <div>
                            <div className="font-medium">
                              •••• •••• •••• {card.last4}
                            </div>
                            <div className="text-sm text-gray-500">
                              Expire le {card.expMonth}/{card.expYear}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {card.brand === 'visa' && (
                            <span className="text-blue-600 font-semibold">VISA</span>
                          )}
                          {card.brand === 'mastercard' && (
                            <span className="text-red-600 font-semibold">MasterCard</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    className="text-teal-600 font-medium text-sm hover:text-teal-700"
                    onClick={handleShowNewCardForm}
                  >
                    + Utiliser une nouvelle carte
                  </button>
                </div>
              </div>
            )}

            {/* New Card Form */}
            {showForm && (
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="cardNumber" className="form-label">
                    Numéro de carte
                  </label>
                  <input
                    id="cardNumber"
                    name="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="form-control"
                    value={formData.cardNumber}
                    onChange={(e) => {
                      const formattedValue = formatCardNumber(e.target.value);
                      setFormData({ ...formData, cardNumber: formattedValue });
                    }}
                    maxLength={19}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cardName" className="form-label">
                    Nom sur la carte
                  </label>
                  <input
                    id="cardName"
                    name="cardName"
                    type="text"
                    placeholder="JEAN DUPONT"
                    className="form-control"
                    value={formData.cardName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="expiry" className="form-label">
                      Date d'expiration (MM/YY)
                    </label>
                    <input
                      id="expiry"
                      name="expiry"
                      type="text"
                      placeholder="MM/YY"
                      className="form-control"
                      value={formData.expiry}
                      onChange={(e) => {
                        const formattedValue = formatExpiry(e.target.value);
                        setFormData({ ...formData, expiry: formattedValue });
                      }}
                      maxLength={5}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cvc" className="form-label">
                      Code de sécurité (CVC)
                    </label>
                    <input
                      id="cvc"
                      name="cvc"
                      type="text"
                      placeholder="123"
                      className="form-control"
                      value={formData.cvc}
                      onChange={handleChange}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center mt-4">
                  <input
                    id="saveCard"
                    name="saveCard"
                    type="checkbox"
                    className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    checked={formData.saveCard}
                    onChange={handleChange}
                  />
                  <label htmlFor="saveCard" className="ml-2 text-sm text-gray-700">
                    Sauvegarder cette carte pour mes prochains paiements
                  </label>
                </div>
              </div>
            )}
          </>
        )}

        {/* Virement bancaire */}
        {paymentMethod === 'virement' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <p className="text-blue-700 mb-2">
              <strong>Instructions pour le virement bancaire :</strong>
            </p>
            <p className="text-blue-700 mb-1">
              Titulaire du compte : Pro-Trans SAS
            </p>
            <p className="text-blue-700 mb-1">
              IBAN : FR76 1234 5678 9012 3456 7890 123
            </p>
            <p className="text-blue-700 mb-1">
              BIC : ABCDEFGH
            </p>
            <p className="text-blue-700 mb-1">
              Motif : Transport {devisId}
            </p>
            <p className="text-sm text-blue-600 mt-4">
              Attention : Votre réservation sera confirmée uniquement après réception du paiement. Veuillez prévoir un délai de 2 à 3 jours ouvrés.
            </p>
          </div>
        )}

        {/* PayPal */}
        {paymentMethod === 'paypal' && (
          <div className="text-center bg-blue-50 border border-blue-200 rounded-md p-6 mb-6">
            <p className="text-blue-700 mb-4">
              Vous allez être redirigé vers PayPal pour finaliser votre paiement.
            </p>
            {/* PayPal button would be integrated here */}
            <Button
              type="button"
              variant="primary"
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => toast.info('Redirection vers PayPal (simulation)')}
            >
              Payer avec PayPal
            </Button>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
          <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-2" />
          <span>Paiement 100% sécurisé avec cryptage SSL</span>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={loading}
            disabled={loading || (paymentMethod === 'card' && !selectedCard && !showForm)}
          >
            {loading ? 'Traitement en cours...' : 'Confirmer le paiement'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentComponent;