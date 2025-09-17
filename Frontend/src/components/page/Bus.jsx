import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Bus = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [buses, setBuses] = useState([]);
    const navigate = useNavigate()
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: "http://localhost:5000/api/v3",
        });

        const res = await axios.get(
          "http://localhost:5000/api/v1/driver/allBus",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setBuses(res.data.AllBus || []);
      } catch (error) {
        console.log("Error fetching buses:", error);
      }
    };

    fetchBuses();
  }, [getAccessTokenSilently]);

  const handleCreateBus = () => {
     navigate("/createbus")
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">All Buses</h1>
        <Button onClick={handleCreateBus}>+ Create Bus</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {buses.length > 0 ? (
          buses.map((bus) => (
            <Card key={bus._id} className="shadow-md rounded-2xl">
              <CardHeader>
                <CardTitle>{bus.deviceID}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>From:</strong> {bus.from}
                </p>
                <p>
                  <strong>To:</strong> {bus.to}
                </p>
                {bus.driver && (
                  <div className="mt-2 border-t pt-2 text-sm">
                    <p>
                      <strong>Driver:</strong> {bus.driver.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {bus.driver.email}
                    </p>
                    <p>
                      <strong>Licence ID:</strong> {bus.driver.licenceId}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <p>No buses found.</p>
        )}
      </div>
    </div>
  );
};

export default Bus;
