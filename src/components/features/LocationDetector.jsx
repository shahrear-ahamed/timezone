import { useCallback, useEffect, useState } from 'react';

const formatCoordinate = (value) => (typeof value === 'number' ? value.toFixed(4) : '—');

const reverseGeocode = async (latitude, longitude) => {
  const params = new URLSearchParams({
    latitude,
    longitude,
    localityLanguage: 'en',
  });

  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error('Reverse geocoding failed');
  }

  const data = await response.json();

  return {
    city: data.city || data.locality || data.principalSubdivision || 'Unknown city',
    country: data.countryName || 'Unknown country',
  };
};

function LocationDetector() {
  const [status, setStatus] = useState('idle');
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Geolocation is not supported in this browser.');
      return;
    }

    setStatus('locating');
    setErrorMessage('');
    setAddress(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        setStatus('resolving');
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setErrorMessage('Location permission denied.');
          setStatus('denied');
          return;
        }

        setErrorMessage('Unable to retrieve your location. Please try again.');
        setStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    let cancelled = false;

    const runReverseGeocoding = async () => {
      if (!coords || status !== 'resolving') {
        return;
      }

      try {
        const result = await reverseGeocode(coords.latitude, coords.longitude);
        if (cancelled) {
          return;
        }

        setAddress(result);
        setStatus('success');
      } catch (error) {
        if (cancelled) {
          return;
        }

        setStatus('partial');
        setErrorMessage('Coordinates detected, but we could not resolve the address.');
      }
    };

    runReverseGeocoding();

    return () => {
      cancelled = true;
    };
  }, [coords, status]);

  const isLoading = status === 'locating' || status === 'resolving';

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Current location</p>
          <h2 className="text-xl font-semibold text-gray-900">Browser Geolocation</h2>
        </div>
        <button
          onClick={requestLocation}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? 'Detecting...' : 'Detect Again'}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="p-4 border rounded-md bg-gray-50">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Latitude</p>
          <p className="text-lg font-mono text-gray-900">{formatCoordinate(coords?.latitude)}</p>
        </div>
        <div className="p-4 border rounded-md bg-gray-50">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Longitude</p>
          <p className="text-lg font-mono text-gray-900">{formatCoordinate(coords?.longitude)}</p>
        </div>
      </div>

      {address && (
        <div className="p-4 border rounded-md bg-green-50 text-green-900">
          <p className="text-sm font-semibold">{address.city}</p>
          <p className="text-sm">{address.country}</p>
        </div>
      )}

      {!address && status === 'locating' && (
        <p className="text-sm text-gray-500">Waiting for location permission...</p>
      )}

      {status === 'denied' && (
        <p className="text-sm text-red-600 font-medium">Location permission denied.</p>
      )}

      {status === 'error' && (
        <p className="text-sm text-red-600">
          {errorMessage || 'Something went wrong while detecting your location.'}
        </p>
      )}

      {status === 'partial' && (
        <p className="text-sm text-yellow-700">{errorMessage}</p>
      )}
    </div>
  );
}

export default LocationDetector;

