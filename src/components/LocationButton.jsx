function LocationButton({ onLocation, loading }) {
  return (
    <button
      type="button"
      onClick={onLocation}
      disabled={loading}
      className="location-button"
    >
      {loading ? "Getting location..." : "◎ My Location"}
    </button>
  );
}

export default LocationButton;