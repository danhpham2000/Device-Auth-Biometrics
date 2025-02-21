import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [email, setEmail] = useState("");
  const [userID, setUserID] = useState<Uint8Array | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Set time expires
  const timeBound = 1 * 60 * 1000;
  const expiresAt = new Date(Date.now() + timeBound).toISOString();
  const deviceBound = navigator.userAgent;

  // Check token logic for trusted device
  useEffect(() => {
    const tokenAvailable = localStorage.getItem("token");

    if (!tokenAvailable) {
      console.log("Token not available, please login ");
      return;
    }

    try {
      const parsedToken = JSON.parse(tokenAvailable);

      if (new Date(Date.now()).toISOString() >= parsedToken.timeBound) {
        console.log("Token expired. Removing...");
        localStorage.removeItem("token");
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const registerEmailForVerification = async (e: any) => {
    e.preventDefault();
    let emailRegister = await navigator.credentials.create({
      publicKey: {
        challenge: new Uint8Array([]),
        rp: { id: "localhost", name: "Auth Device" },
        user: {
          id: new Uint8Array([]),
          name: email,
          displayName: email,
        },
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          requireResidentKey: false,
          userVerification: "required",
        },
        attestation: "none",
        pubKeyCredParams: [],
        timeout: timeBound,
      },
    });

    if (Boolean(emailRegister)) {
      console.log("Biometrics verify ok");
      setUserID((emailRegister as PublicKeyCredential).rawId);
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          deviceID: deviceBound,
          tokenExpires: expiresAt,
        }),
      });

      console.log(res);
      return true;
    }
  };

  const verifyEmail = async (e: any) => {
    e.preventDefault();

    console.log(email);
    console.log(deviceBound);

    const checkToken = localStorage.getItem("token");
    if (checkToken) {
      console.log("Token is avaialbe, no need to check server-side");
      const parsedToken = JSON.parse(checkToken);
      const checkCompatible = navigator.userAgent === parsedToken.deviceToken;

      console.log("Check compatible", checkCompatible);

      if (!checkCompatible) {
        console.log("Token expires or device not correct");
        setMessage("Error check because device not correct");
        return;
      }

      console.log("Begin biometrics");
      const checkBiometrics = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(0),
          rpId: "localhost",
          userVerification: "required",
          allowCredentials: [],
        },
      });

      if (checkBiometrics) {
        console.log("End biometrics after verification");

        setMessage("Grant access");
        return;
      }
    } else {
      console.log("There is no token");

      let emailCredential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(0),
          rpId: "localhost",
          userVerification: "required",
          allowCredentials: [],
        },
      });
      if (emailCredential) {
        const res = await fetch("http://localhost:8000/login", {
          method: "POST",
          body: JSON.stringify({
            email: email,
            deviceID: navigator.userAgent.toString(),
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        localStorage.setItem(
          "token",
          JSON.stringify({ deviceToken: deviceBound, timeBound: expiresAt })
        );

        if (res.ok) {
          const result = await res.json();
          console.log(result);
          setMessage("Grant access");
          return result;
        }
      } else {
        setError("Unauthorized credential");
        return error;
      }
    }
  };

  return (
    <div className="container">
      <h1>Email Biometric Form</h1>

      {<div className="message">{message}</div>}
      {error && <div className="message">{error}</div>}
      <input type="email" onChange={(e) => setEmail(e.target.value)} />
      <button type="submit" onClick={registerEmailForVerification}>
        Submit with Touch ID
      </button>
      <button type="submit" onClick={verifyEmail}>
        Verify with Touch ID
      </button>
    </div>
  );
}
