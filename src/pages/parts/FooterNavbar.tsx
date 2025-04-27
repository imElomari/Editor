
const FooterNavbar = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-4">
      <div className="container mx-auto text-center text-muted-foreground text-xs">
        <p><strong>Label Editor</strong> By Atlasimex SL. © {currentYear} All rights reserved.</p>
      </div>
    </footer>
  );
};

export default FooterNavbar;
