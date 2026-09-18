import { Route, Routes } from "react-router-dom";

import Navbar from "@/components/Navbar";
import RequireAdmin from "@/components/RequireAdmin";
import RequireAuth from "@/components/RequireAuth";
import Admin from "@/pages/Admin";
import CreateListing from "@/pages/CreateListing";
import Home from "@/pages/Home";
import ListingDetail from "@/pages/ListingDetail";
import Listings from "@/pages/Listings";
import Login from "@/pages/Login";
import MyListings from "@/pages/MyListings";
import MyProposals from "@/pages/MyProposals";
import ProposalDetail from "@/pages/ProposalDetail";
import Register from "@/pages/Register";
import Wishlist from "@/pages/Wishlist";

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route
          path="/listings/new"
          element={
            <RequireAuth>
              <CreateListing />
            </RequireAuth>
          }
        />
        <Route
          path="/my-listings"
          element={
            <RequireAuth>
              <MyListings />
            </RequireAuth>
          }
        />
        <Route
          path="/my-proposals"
          element={
            <RequireAuth>
              <MyProposals />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          }
        />
        <Route
          path="/wishlist"
          element={
            <RequireAuth>
              <Wishlist />
            </RequireAuth>
          }
        />
        <Route
          path="/proposals/:id"
          element={
            <RequireAuth>
              <ProposalDetail />
            </RequireAuth>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
