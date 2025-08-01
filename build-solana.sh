
#!/bin/bash
cd programs/fundr

# Install Rust target if needed
rustup target add bpfel-unknown-unknown || true

# Build with cargo directly
cargo build --release --target bpfel-unknown-unknown

# Copy the built program to deploy directory
mkdir -p ../../target/deploy
if [ -f target/bpfel-unknown-unknown/release/fundr.so ]; then
  cp target/bpfel-unknown-unknown/release/fundr.so ../../target/deploy/
  echo "✓ Program built successfully"
else
  echo "❌ Build failed - trying alternative approach"
  # Try direct rustc compilation as fallback
  rustc --target bpfel-unknown-unknown \
    -C opt-level=3 \
    -C lto=fat \
    -C codegen-units=1 \
    --crate-type cdylib \
    src/lib.rs \
    -o ../../target/deploy/fundr.so \
    -L target/release/deps
fi
