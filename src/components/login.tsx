import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";

interface FormValue {
  email: string;
  password: string;
  captcha: string;
}

const Login: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggin, setisLoggin] = useState<boolean>(false);
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValue>();
  const captchaRef = useRef<ReCAPTCHA>(null);

  const onSubmit = async (data: FormValue) => {
    setErrorMessage(null);

    if (!data.captcha) {
      setErrorMessage("Please complete the captcha verification");
      return;
    }

    try {
      // Log the request data for debugging
      console.log("Sending request with data:", {
        email: data.email,
        password: data.password,
        captcha: data.captcha,
      });

      const response = await axios.post(
        `${import.meta.env.VITE_APP_PORT_SERVER}/api/submit-reCaptcha-v2`,
        {
          email: data.email,
          password: data.password,
          captcha: data.captcha,
        }
      );
      setisLoggin(true);
      console.log("Login successful:", response.data);
      localStorage.setItem("token", response.data.data);
    } catch (error: any) {
      console.error("Login failed:", error);

      // More detailed error logging
      if (error.response) {
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
      }

      setErrorMessage(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      captchaRef.current?.reset();
      setValue("captcha", "");
    }
  };

  const handleCaptchaChange = (token: string | null) => {
    setValue("captcha", token || "");
    if (token) setErrorMessage(null);
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        {isLoggin ? (
          <p>succes login</p>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm text-left font-medium mb-1">
                  Email
                </label>
                <input
                  {...register("email", { required: "Email is required" })}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border rounded-md"
                />
                {errors?.email && (
                  <p className="text-red-500 text-sm mt-1 text-left">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-left text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 border rounded-md"
                />
                {errors?.password && (
                  <p className="text-red-500 text-sm mt-1 text-left">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex justify-center my-4">
                <ReCAPTCHA
                  ref={captchaRef}
                  sitekey={import.meta.env.VITE_APP_SITE_KEY}
                  onChange={handleCaptchaChange}
                />
              </div>
              {errors?.captcha && (
                <p className="text-red-500 text-sm mt-1 text-center">
                  {errors.captcha.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
