import { Map, Marker, GoogleApiWrapper } from "google-maps-react";
import { Component } from "react";
import Spinner from "./Spinner";

class MapContainer extends Component {
  render() {
    return (
      <Map
        google={window.google}
        zoom={14}
        style={{ width: "100%", height: "100%", position: "relative" }}
        containerStyle={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
        initialCenter={{
          lat:
            this.props.locations != null
              ? this.props.locations[0].latitude ?? 33.62783652204346
              : 33.62783652204346,
          lng:
            this.props.locations != null
              ? this.props.locations[0].longitude ?? -117.7255077871468
              : -117.7255077871468,
        }}
      >
        {this.props.locations != null &&
          this.props.locations.map((location, i) => {
            return (
              <Marker
                key={location.location}
                onClick={() => this.props.setLocation(i)}
                name={"Current location"}
                position={{ lat: location.latitude, lng: location.longitude }}
              />
            );
          })}
      </Map>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyC8H1IaUNT1a_LnO7OF6L2OXYZXFPJcnLI",
  loadingContainer: (props) => (
    <div className="loading-container-full">
      <Spinner />
    </div>
  ),
})(MapContainer);
