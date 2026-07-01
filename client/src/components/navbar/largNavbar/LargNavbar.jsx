import { useState } from "react";
import "./LargNavbar.css";
import { Link, NavLink } from "react-router-dom";
import $ from "jquery";
import { PiUser } from "react-icons/pi";
import { BiSolidCastle } from "react-icons/bi";
import { FaUserLarge } from "react-icons/fa6";
import { FaSignOutAlt } from "react-icons/fa";
import { ImLab } from "react-icons/im";
import { FaRegCircleUser } from "react-icons/fa6";

const Data = {
  navIcon: "/images/GalaxyNFT.png",
  navLink: [
    { name: "Home", link: "/home" },
    { name: "Marketplace", link: "/nfts" },
    { name: "Rankings", link: "/rankings" },
    { name: "Support", link: "/support" },
  ],
};

const LargNavbar = ({ rowData, setData }) => {
  const [walletAddress, setWalletAddress] = useState("");

  const HandelNaveMenu = () => {
    $(".userMenu").toggleClass("show");
  };

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it and try again.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (error) {
      console.error("MetaMask connect failed:", error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg mx-3 mt-3 mb-4" id="Lnav">
      <div className="container-fluid">
        <Link
          className="nav-prand d-flex justify-content-center align-items-center gap-2 text-decoration-none"
          to="/home"
        >
          <img src={Data.navIcon} alt="icon" width="25px" />
          <span className="F1">
            <span className="lemon">GALAXY</span>NFT
          </span>
        </Link>
        <div className=" navbar-collapse justify-content-end  gap-4">
          <ul className="list-unstyled d-flex gap-5 m-0">
            {Data.navLink.map((item, index) => (
              <li key={index}>
                <NavLink className="F3" to={item.link}>
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
          {rowData.Access.haveaccess ? (
            <div className="userToolsComponant">
              <div
                to="/account"
                className="btnTempUser d-flex justify-content-center align-items-center"
                type="submit"
                onClick={HandelNaveMenu}
              >
                {rowData.Access.accountInfo.userAvatar ? (
                  <img
                    src={rowData.Access.accountInfo.userAvatar}
                    alt="user img"
                  />
                ) : (
                  <div className="parIcon d-flex justify-content-center align-items-center">
                    <FaRegCircleUser className="Icon" />
                  </div>
                )}
              </div>
              <div className="userMenu">
                <div className="triangle-up" />
                <NavLink
                  to="/home"
                  className="ps-2 d-flex align-items-center gap-2 my-2 menuButton"
                  onClick={HandelNaveMenu}
                >
                  <BiSolidCastle />
                  <span>Home</span>
                </NavLink>
                <NavLink
                  to="/nftlab"
                  className="ps-2 d-flex align-items-center gap-2 my-2 menuButton"
                  onClick={HandelNaveMenu}
                >
                  <ImLab />
                  <span>NFT Lab</span>
                </NavLink>
                <NavLink
                  to="/account"
                  className="ps-2 d-flex align-items-center gap-2 my-2 menuButton"
                  onClick={HandelNaveMenu}
                >
                  <FaUserLarge />
                  <span>Account</span>
                </NavLink>
                <div
                  className="ps-2 d-flex align-items-center gap-2 my-2 menuButton"
                  onClick={() =>
                    setData((prvData) => ({
                      ...prvData,
                      Access: {
                        ...prvData.Access,
                        haveaccess: "",
                        accountInfo: {
                          userAvatar: "",
                          userName: "",
                          userEmail: "",
                          userLinks: {
                            FaceBookLink: "",
                            disCordLink: "",
                            youtubeLink: "",
                            xLink: "",
                            instgramLink: "",
                          },
                          userBio: "",
                          userPassword: "",
                        },
                      },
                    }))
                  }
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-3">
              <button
                className="btnTemp d-flex justify-content-center align-items-center px-3 py-2"
                type="button"
                onClick={connectMetaMask}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                  alt="MetaMask"
                  width="18"
                  height="18"
                  className="me-2"
                />
                Connect Wallet
              </button>
              <NavLink
                to="/signup"
                className="btnTemp d-flex justify-content-center align-items-center px-3 py-2"
                type="submit"
              >
                <PiUser className="PiUser me-2 my-1" />
                sing up
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default LargNavbar;
