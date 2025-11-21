import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Logo from "./assets/Image/pineappleLogo.png"
import GoogleImg from './assets/Image/googleA.png'
const roleData = [
  { label: 'User', value: 'user' },
  { label: 'Partner', value: 'partner' },
  { label: 'Advertiser', value: 'advertiser' },
];

const App = () => {
  const [role, setRole] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loginNum, setLoginNum] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [passwordHide, setPasswordHide] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);

  // Timer for OTP
  useEffect(() => {
    if (showOtpModal) {
      startOtpTimer();
    }
    return () => clearInterval(timerRef.current);
  }, [showOtpModal]);

  const startOtpTimer = () => {
    setCanResend(false);
    setTimer(300);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const validate = () => {
    const newErrors = {};

    if (!loginNum.trim() && !isRegister) {
      newErrors.loginNum = 'Number is required';
    } else if (loginNum.length !== 10 && !isRegister) {
      newErrors.loginNum = 'Invalid Number (must be 10 digits)';
    }

    if (passwordHide || isRegister) {
      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    if (isRegister) {
      if (!name.trim()) newErrors.name = 'Full name is required';
      if (!email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';

      if (!phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^\d{10}$/.test(phone)) newErrors.phone = 'Invalid phone number (must be 10 digits)';

      if (!role) newErrors.role = 'Please select a role';

      if (!confirmPassword) newErrors.confirmPassword = 'Please confirm password';
      else if (confirmPassword !== password)
        newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const storeData = async (value) => {
    try {
      localStorage.setItem('userId', value);
      console.log("Data stored successfully");
    } catch (e) {
      console.log("Error storing data: ", e);
    }
  };

  const sendOtp = async () => {
    if (!phone.trim() || phone.length !== 10 || !/^\d+$/.test(phone)) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }
    setIsSendingOtp(true);

    try {
      const response = await axios.post("/api/send_otp", {
        mobile: phone,
      });
      
      setShowOtpModal(true);
      console.log("OTP API response:", response.data);

      if (response.data.success) {
        setShowOtpModal(true);
        alert('OTP sent successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.log('Error sending OTP:', error);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6 || !/^\d+$/.test(otp)) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }
    setIsVerifyingOtp(true);
    try {
      const response = await axios.post("/api/verify_otp", {
        mobile: phone,
        otp: otp,
      });

      console.log("OTP Verification Response:", response.data);

      if (response.data.status === "success") {
        setOtpVerified(true);
        alert('Phone number verified successfully!');
        setTimeout(() => {
          setShowOtpModal(false);
        }, 1500);
      } else {
        throw new Error(response.data.message || "OTP verification failed");
      }
    } catch (error) {
      console.log('Error verifying OTP:', error);
      alert('OTP verification failed. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (isRegister) {
      setIsLoading(true);
      try {
        if (role === 'partner') {
          // Handle partner registration
        } else if (role === "user") {
          const response = await axios.post('/api/register', {
            fullname: name,
            email: email,
            mobile: phone,
            role: role,
            password: password,
          });
          
          if (response?.data?.status === 'success') {
            alert('Registration successful!');
            await storeData(response?.data?.partner?.user_id);
            setIsRegister(false);
            setLoginNum(phone);
            setPasswordHide(false);
            setName('');
            setEmail('');
            setPhone('');
            setRole(null);
            setPassword('');
            setConfirmPassword('');
            setOtpVerified(false);
          } else {
            alert(response?.data?.message || 'Registration failed');
          }
        }
      } catch (error) {
        console.log('API Error:', error);
        alert('Something went wrong!');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        if (!passwordHide) {
          const response = await axios.post('/api/check_user', { mobile: loginNum });

          if (response?.data?.status === 'not_exists') {
            setIsRegister(true);
            alert('User not found. Please register.');
          } else if (response?.data?.status === 'exists') {
            setPasswordHide(true);
          }
        } else {
          const response = await axios.post('/api/login', {
            mobile: loginNum,
            password: password
          });

          if (response?.data?.status === 'success') {
            await storeData(response?.data?.user_id);
            setLoginNum('');
            setPassword('');
            setPasswordHide(false);
          } else {
            alert(response?.data?.message || 'Login failed');
          }
        }
      } catch (error) {
        console.log('API Error:', error);
        alert('Something went wrong!');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      width: '100vw',
      fontFamily: "'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
      background: 'linear-gradient(90deg, #ffcc00, #04bf9d)',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {/* Login Form */}
      <div style={{
        width: '100%',
        maxWidth: '450px',
        height:'10%',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        padding: '3rem',
        margin: '2rem'
      }}>
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <img src={Logo} alt="Application Logo" style={{
            width: '180px',
            marginBottom: '1.5rem'
          }} />
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            {isRegister ? 'Fill in the details to register' : 'Enter your details below'}
          </p>
        </div>

        {isRegister ? (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem',
                  fontSize: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#f8fafc'
                }}
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <p style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.name}</p>}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <input
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem',
                  fontSize: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#f8fafc'
                }}
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.email}</p>}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input
                  style={{
                    flex: 1,
                    padding: '0.9rem 1rem',
                    fontSize: '1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#f8fafc'
                  }}
                  placeholder="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setOtpVerified(false);
                  }}
                  maxLength={10}
                />
                <button
                  style={{
                    minWidth: '100px',
                    padding: '0.9rem',
                    background: otpVerified ? '#4CAF50' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: isSendingOtp || otpVerified || phone.length !== 10 ? 0.7 : 1,
                    pointerEvents: isSendingOtp || otpVerified || phone.length !== 10 ? 'none' : 'auto'
                  }}
                  onClick={otpVerified ? undefined : sendOtp}
                >
                  {isSendingOtp ? (
                    <div style={{
                      display: 'inline-block',
                      width: '1rem',
                      height: '1rem',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderRadius: '50%',
                      borderTopColor: 'white',
                      animation: 'spin 1s ease-in-out infinite'
                    }} />
                  ) : otpVerified ? (
                    '✓ Verified'
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
              {errors.phone && <p style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.phone}</p>}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <select
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem',
                  fontSize: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#f8fafc',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1rem'
                }}
                value={role}
                onChange={handleRoleChange}
              >
                <option value="">Select Category</option>
                {roleData.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.role && <p style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.role}</p>}
            </div>

            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
              <input
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem',
                  fontSize: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#f8fafc',
                  paddingRight: '3rem'
                }}
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
              {errors.password && <p style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.password}</p>}
            </div>

            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
              <input
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem',
                  fontSize: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#f8fafc',
                  paddingRight: '3rem'
                }}
                placeholder="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                type="button"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
              {errors.confirmPassword && <p style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.confirmPassword}</p>}
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                style={{
                  width: '100%',
                  padding: '0.9rem 1rem',
                  fontSize: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#f8fafc'
                }}
                placeholder="Phone Number"
                type="tel"
                value={loginNum}
                onChange={(e) => setLoginNum(e.target.value)}
                maxLength={10}
              />
              {errors.loginNum && <p style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.loginNum}</p>}
            </div>

            {passwordHide && (
              <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <input
                  style={{
                    width: '100%',
                    padding: '0.9rem 1rem',
                    fontSize: '1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    backgroundColor: '#f8fafc',
                    paddingRight: '3rem'
                  }}
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '1.2rem'
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
                {errors.password && <p style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.password}</p>}
              </div>
            )}
          </>
        )}

        <button
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: 'none',
            background: 'linear-gradient(90deg, #ffcc00, #04bf9d)',
            color: 'white',
            marginTop: '1rem',
            opacity: isLoading ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
          onClick={handleSubmit}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? (
            <div style={{
              display: 'inline-block',
              width: '1rem',
              height: '1rem',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              borderTopColor: 'white',
              animation: 'spin 1s ease-in-out infinite'
            }} />
          ) : isRegister ? (
            'Register'
          ) : role === 'partner' ? (
            'Next'
          ) : (
            passwordHide ? 'Login' : 'Continue'
          )}
        </button>

        {!isRegister && !passwordHide && (
          <button
            style={{
              color: '#666',
              fontSize: '0.95rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginTop: '1rem',
              display: 'block',
              width: '100%',
              textAlign: 'center'
            }}
            type="button"
          >
            Forgot your Password?
          </button>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '1.5rem 0',
          color: '#94a3b8'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <span style={{ padding: '0 1rem' }}>Or sign in with</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>

        <button
          style={{
            width: '100%',
            padding: '0.9rem',
            fontSize: '1rem',
            fontWeight: 500,
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '1px solid #e2e8f0',
            background: 'white',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem'
          }}
          onClick={() => console.log('Google Sign In')}
          disabled={isLoading}
          type="button"
        >
          <img
            src={GoogleImg}
            alt="Google"
            style={{ width: '20px', height: '20px' }}
          />
          <span>Sign in with Google</span>
        </button>

        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.95rem',
          color: '#64748b'
        }}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button
            style={{
              color: '#3b82f6',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              padding: 0
            }}
            onClick={() => {
              setIsRegister(!isRegister);
              setPasswordHide(false);
              setOtpVerified(false);
            }}
            disabled={isLoading}
            type="button"
          >
            {isRegister ? 'Login' : 'Register'}
          </button>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            animation: 'modalFadeIn 0.3s ease-out'
          }}>
            {otpVerified ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{
                  fontSize: '4rem',
                  color: '#4CAF50',
                  marginBottom: '1rem'
                }}>✓</div>
                <p style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#4CAF50'
                }}>OTP Verified Successfully!</p>
              </div>
            ) : (
              <>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>OTP Verification</h3>
                <p style={{
                  color: '#666',
                  textAlign: 'center',
                  marginBottom: '1.5rem'
                }}>
                  We've sent a 6-digit OTP to your phone number {phone}
                </p>
                <input
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1.25rem',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    marginBottom: '1.5rem'
                  }}
                  placeholder="Enter OTP"
                  type="tel"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />

                <button
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: isVerifyingOtp ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  onClick={verifyOtp}
                  disabled={isVerifyingOtp}
                  type="button"
                >
                  {isVerifyingOtp ? (
                    <div style={{
                      display: 'inline-block',
                      width: '1rem',
                      height: '1rem',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderRadius: '50%',
                      borderTopColor: 'white',
                      animation: 'spin 1s ease-in-out infinite'
                    }} />
                  ) : (
                    'Verify OTP'
                  )}
                </button>

                <div style={{ width: '100%', marginTop: '1rem' }}>
                  {canResend ? (
                    <button
                      style={{
                        width: '100%',
                        padding: '0.9rem',
                        background: 'linear-gradient(90deg, #04bf9d, #04bf9d)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setOtp('');
                        sendOtp();
                        startOtpTimer();
                      }}
                      type="button"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <div style={{
                      padding: '0.9rem',
                      background: '#f0f0f0',
                      borderRadius: '8px',
                      color: '#333',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}>
                      Resend in {formatTime(timer)}
                    </div>
                  )}
                </div>

                <button
                  style={{
                    color: '#666',
                    fontSize: '0.95rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '1rem',
                    display: 'block',
                    width: '100%',
                    textAlign: 'center'
                  }}
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtp('');
                    clearInterval(timerRef.current);
                  }}
                  type="button"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default App;