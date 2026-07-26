"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Load saved profile picture
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().profilePic) {
            setProfilePic(docSnap.data().profilePic);
          }
        } catch (error) {
          console.log("Error loading profile pic:", error);
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 500KB)
    if (file.size > 500 * 1024) {
      alert("Please choose a picture smaller than 500 KB");
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;

      try {
        // Save to Firestore
        await setDoc(
          doc(db, "users", user.uid),
          {
            email: user.email,
            profilePic: base64String,
            updatedAt: new Date(),
          },
          { merge: true }
        );

        setProfilePic(base64String);
        alert("Profile picture updated successfully!");
      } catch (error) {
        alert("Error uploading picture: " + error.message);
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  // Default avatar if no picture
  const getAvatarUrl = (email) => {
    if (!email) return "https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff&size=200";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      email
    )}&background=4f46e5&color=fff&size=200&bold=true`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-700">My Profile</h1>
          <Link
            href="/dashboard"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          {/* Profile Picture */}
          <div className="mb-6 relative inline-block">
            <img
              src={profilePic || getAvatarUrl(user.email)}
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto border-4 border-indigo-100 shadow-md object-cover"
            />
          </div>

          {/* Upload Button */}
          <div className="mb-6">
            <label className="cursor-pointer bg-indigo-100 text-indigo-700 px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-200 transition inline-block">
              {uploading ? "Uploading..." : "Upload Picture"}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Max size: 500 KB
            </p>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Welcome back!
          </h2>

          <p className="text-gray-600 mb-1">Email</p>
          <p className="text-lg font-medium text-indigo-700 mb-8 break-all">
            {user.email}
          </p>

          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Go to Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}